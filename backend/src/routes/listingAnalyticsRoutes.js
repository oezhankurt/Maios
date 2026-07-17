const express = require('express');
const { authenticate } = require('../middleware/auth');
const listingAnalyticsController = require('../controllers/listingAnalyticsController');

const router = express.Router();

router.use(authenticate);

router.get('/', listingAnalyticsController.getComprehensiveAnalytics);
router.get('/performance', listingAnalyticsController.getPerformance);
router.get('/platforms', listingAnalyticsController.getPlatformStats);
router.get('/optimization', listingAnalyticsController.getOptimizationStats);
router.get('/status', listingAnalyticsController.getStatusDistribution);
router.get('/pricing', listingAnalyticsController.getPriceAnalysis);
router.get('/trends', listingAnalyticsController.getPublishingTrends);
router.get('/sync', listingAnalyticsController.getSyncStatus);

module.exports = router;
