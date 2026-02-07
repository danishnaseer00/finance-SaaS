const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', analyticsController.getDashboard);
router.get('/snapshot', analyticsController.getSnapshot);
router.get('/trends', analyticsController.getTrends);
router.get('/categories', analyticsController.getCategoryBreakdown);
router.get('/daily-trends', analyticsController.getDailyTrends);

module.exports = router;
