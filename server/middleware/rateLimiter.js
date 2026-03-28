const rateLimit = require('express-rate-limit');
const { NODE_ENV } = require('../config/env');

const keyGenerator = (req) => {
  if (req.user) {
    return `${req.ip}-${req.user.id}`;
  }
  return req.ip;
};

const handler = (req, res, next, options) => {
  return res.status(429).json({
    success: false,
    message: options.message,
    retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes',
  });
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'development' ? 100 : 5,
  message: 'Too many auth attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

const tripLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many trip requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

module.exports = { globalLimiter, authLimiter, tripLimiter };
