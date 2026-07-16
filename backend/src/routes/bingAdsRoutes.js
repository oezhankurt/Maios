const express = require('express');
const controller = require('../controllers/bingAdsController');

const router = express.Router();

router.get('/campaigns', controller.getCampaigns);
router.get('/campaigns/:id', controller.getCampaign);
router.get('/keywords', controller.getKeywords);
router.get('/performance', controller.getPerformance);
router.post('/optimize', controller.suggestOptimizations);

module.exports = router;
