const mongoose = require('mongoose');

const apiMetricsSchema = new mongoose.Schema(
  {
    service: {
      type: String,
      required: [true, 'Service name is required'],
      unique: true,
      trim: true,
    },
    remainingCalls: {
      type: Number,
      default: 0,
      min: [0, 'Remaining calls cannot be negative'],
    },
    lastSuccess: {
      type: Date,
      default: null,
    },
    cacheHits: {
      type: Number,
      default: 0,
      min: [0, 'Cache hits cannot be negative'],
    },
    cacheMisses: {
      type: Number,
      default: 0,
      min: [0, 'Cache misses cannot be negative'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApiMetrics', apiMetricsSchema);
