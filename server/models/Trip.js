const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Source is required'],
      trim: true,
      maxlength: [100, 'Source cannot exceed 100 characters'],
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
      maxlength: [100, 'Destination cannot exceed 100 characters'],
    },
    date: {
      type: Date,
      validate: {
        validator: function (v) {
          return v >= new Date(new Date().setHours(0, 0, 0, 0));
        },
        message: 'Date cannot be in the past',
      },
    },
    mode: {
      type: String,
      enum: ['flight', 'road'],
      required: [true, 'Travel mode is required'],
    },
    briefingData: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

tripSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Trip', tripSchema);
