const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { getMetrics, getCacheStats, clearCache, getSystemHealth } = require('../controllers/adminController');

// GET /api/admin/metrics
router.get('/metrics', verifyToken, isAdmin, getMetrics);

// GET /api/admin/cache
router.get('/cache', verifyToken, isAdmin, getCacheStats);

// DELETE /api/admin/cache
router.delete('/cache', verifyToken, isAdmin, clearCache);

// GET /api/admin/health
router.get('/health', verifyToken, isAdmin, getSystemHealth);

module.exports = router;
