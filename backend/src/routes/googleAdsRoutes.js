const express = require('express');
const controller = require('../controllers/googleAdsController');

const router = express.Router();

router.get('/campaigns', controller.getCampaigns);
router.get('/campaigns/:id', controller.getCampaign);
router.get('/keywords', controller.getKeywords);
router.post('/keywords/optimize', controller.optimizeKeywords);
router.get('/budget', controller.getBudgetAllocation);
router.get('/performance', controller.getPerformanceReport);

module.exports = router;
