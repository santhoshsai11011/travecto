const ApiMetrics = require('../models/ApiMetrics');
const Trip = require('../models/Trip');
const redis = require('../config/redis');

let getQueueStats;
try {
  const tripQueue = require('../jobs/tripQueue');
  getQueueStats = tripQueue.getQueueStats;
} catch (err) {
  console.warn('tripQueue not available:', err.message);
  getQueueStats = async () => ({ waiting: 0, active: 0, completed: 0, failed: 0, deadLetter: 0 });
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
}

const getMetrics = async (req, res, next) => {
  try {
    const metrics = await ApiMetrics.find({}).sort({ service: 1 });

    const totalHits = metrics.reduce((sum, m) => sum + (m.cacheHits || 0), 0);
    const totalMisses = metrics.reduce((sum, m) => sum + (m.cacheMisses || 0), 0);
    const totalRequests = totalHits + totalMisses;
    const overallHitRate = totalRequests > 0
      ? parseFloat(((totalHits / totalRequests) * 100).toFixed(1))
      : 0;

    let queueStats = { waiting: 0, active: 0, completed: 0, failed: 0, deadLetter: 0 };
    try {
      queueStats = await getQueueStats();
    } catch (err) {
      console.warn('Could not fetch queue stats:', err.message);
    }

    const [totalTrips, todayTrips] = await Promise.all([
      Trip.countDocuments({}),
      Trip.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    const serviceMetrics = metrics.map(m => {
      const total = (m.cacheHits || 0) + (m.cacheMisses || 0);
      const hitRate = total > 0
        ? parseFloat(((m.cacheHits / total) * 100).toFixed(1))
        : 0;
      return {
        service: m.service,
        cacheHits: m.cacheHits || 0,
        cacheMisses: m.cacheMisses || 0,
        hitRate,
        remainingCalls: m.remainingCalls || 0,
        lastSuccess: m.lastSuccess,
        updatedAt: m.updatedAt
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        overview: {
          totalHits,
          totalMisses,
          totalRequests,
          overallHitRate,
          totalTrips,
          todayTrips
        },
        queue: queueStats,
        services: serviceMetrics,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCacheStats = async (req, res, next) => {
  try {
    const info = await redis.info();

    const usedMemory = info.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'N/A';
    const maxMemory = info.match(/maxmemory_human:(.+)/)?.[1]?.trim() || 'N/A';
    const connectedClients = info.match(/connected_clients:(\d+)/)?.[1] || '0';
    const totalCommands = info.match(/total_commands_processed:(\d+)/)?.[1] || '0';
    const uptimeSeconds = info.match(/uptime_in_seconds:(\d+)/)?.[1] || '0';
    const keyspaceHits = info.match(/keyspace_hits:(\d+)/)?.[1] || '0';
    const keyspaceMisses = info.match(/keyspace_misses:(\d+)/)?.[1] || '0';

    // Paginate keys — only fetch first 1000 for performance
    // In production use SCAN instead of KEYS
    const allKeys = await redis.keys('*');
    const limitedKeys = allKeys.slice(0, 1000);

    const keyCategories = {
      weather: limitedKeys.filter(k => k.startsWith('weather:')).length,
      country: limitedKeys.filter(k => k.startsWith('country:')).length,
      currency: limitedKeys.filter(k => k.startsWith('currency:')).length,
      news: limitedKeys.filter(k => k.startsWith('news:')).length,
      flight: limitedKeys.filter(k => k.startsWith('flight:')).length,
      route: limitedKeys.filter(k => k.startsWith('route:')).length,
      carbon: limitedKeys.filter(k => k.startsWith('carbon:')).length,
      stale: limitedKeys.filter(k => k.startsWith('stale:')).length,
      other: limitedKeys.filter(k =>
        !k.startsWith('weather:') &&
        !k.startsWith('country:') &&
        !k.startsWith('currency:') &&
        !k.startsWith('news:') &&
        !k.startsWith('flight:') &&
        !k.startsWith('route:') &&
        !k.startsWith('carbon:') &&
        !k.startsWith('stale:')
      ).length
    };

    return res.status(200).json({
      success: true,
      data: {
        memory: { used: usedMemory, max: maxMemory },
        connections: parseInt(connectedClients),
        totalCommands: parseInt(totalCommands),
        uptimeSeconds: parseInt(uptimeSeconds),
        keyspaceHits: parseInt(keyspaceHits),
        keyspaceMisses: parseInt(keyspaceMisses),
        totalKeys: allKeys.length,
        keyCategories,
        note: allKeys.length > 1000 ? 'Key categories based on first 1000 keys' : null,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

const clearCache = async (req, res, next) => {
  try {
    const { pattern } = req.query;

    if (pattern) {
      const keys = await redis.keys(`${pattern}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return res.status(200).json({
        success: true,
        message: `Cleared ${keys.length} keys matching: ${pattern}:*`
      });
    } else {
      // flushdb clears current DB only — safer than flushall on shared Redis
      await redis.flushdb();
      return res.status(200).json({
        success: true,
        message: 'All cache cleared successfully'
      });
    }
  } catch (error) {
    next(error);
  }
};

const getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      server: 'healthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      uptimeFormatted: formatUptime(process.uptime()),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + 'MB'
      }
    };

    // Check MongoDB
    try {
      await Trip.findOne({}).limit(1);
      health.mongodb = 'healthy';
    } catch {
      health.mongodb = 'unhealthy';
    }

    // Check Redis
    try {
      const pong = await redis.ping();
      health.redis = pong === 'PONG' ? 'healthy' : 'unhealthy';
    } catch {
      health.redis = 'unhealthy';
    }

    health.status = (health.mongodb === 'healthy' && health.redis === 'healthy')
      ? 'healthy' : 'degraded';

    return res.status(200).json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMetrics, getCacheStats, clearCache, getSystemHealth };
