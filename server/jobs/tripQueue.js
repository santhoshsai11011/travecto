const { Queue, QueueEvents } = require('bullmq');
const { REDIS_URL } = require('../config/env');
const ApiMetrics = require('../models/ApiMetrics');

const connection = new (require('ioredis'))(REDIS_URL, {
  maxRetriesPerRequest: null
});

// Main trip queue
const tripQueue = new Queue('trip-briefing', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 }
  }
});

// Dead letter queue for failed jobs
const deadLetterQueue = new Queue('trip-briefing-failed', {
  connection,
  defaultJobOptions: {
    removeOnComplete: { count: 200 }
  }
});

// QueueEvents to listen for job events
const queueEvents = new QueueEvents('trip-briefing', { connection });

queueEvents.on('completed', async ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed`);
  try {
    await ApiMetrics.findOneAndUpdate(
      { service: 'bullmq' },
      {
        $inc: { cacheHits: 1 },
        lastSuccess: new Date(),
        updatedAt: new Date()
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('Failed to update ApiMetrics for job completion:', err.message);
  }
});

queueEvents.on('failed', async ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed: ${failedReason}`);
  try {
    // Move to dead letter queue
    await deadLetterQueue.add('failed-job', {
      originalJobId: jobId,
      reason: failedReason,
      failedAt: new Date().toISOString()
    });
    await ApiMetrics.findOneAndUpdate(
      { service: 'bullmq' },
      {
        $inc: { cacheMisses: 1 },
        updatedAt: new Date()
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('Failed to handle job failure:', err.message);
  }
});

queueEvents.on('progress', ({ jobId, data }) => {
  console.log(`📊 Job ${jobId} progress: ${data}%`);
});

const addTripJob = async (tripData) => {
  const job = await tripQueue.add('fetch-trip', tripData, {
    priority: 1,
    jobId: `trip-${tripData.userId}-${Date.now()}`
  });
  console.log(`🚀 Trip job added: ${job.id}`);
  return job;
};

const getQueueStats = async () => {
  const [waiting, active, completed, failed] = await Promise.all([
    tripQueue.getWaitingCount(),
    tripQueue.getActiveCount(),
    tripQueue.getCompletedCount(),
    tripQueue.getFailedCount()
  ]);
  const deadLetter = await deadLetterQueue.getCompletedCount();
  return {
    waiting,
    active,
    completed,
    failed,
    deadLetter,
    timestamp: new Date().toISOString()
  };
};

module.exports = { tripQueue, deadLetterQueue, addTripJob, getQueueStats, queueEvents };
