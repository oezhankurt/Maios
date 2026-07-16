const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/keywords', require('./keywordRoutes'));
router.use('/rankings', require('./rankingRoutes'));
router.use('/profit', require('./profitRoutes'));
router.use('/ppc', require('./ppcRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/channels', require('./channelsRoutes'));
router.use('/research', require('./researchRoutes'));
router.use('/cerebro', require('./cerebroRoutes'));
router.use('/listings/builder', require('./listingBuilderRoutes'));
router.use('/listings/analyzer', require('./listingAnalyzerRoutes'));
router.use('/listings/index', require('./indexCheckerRoutes'));
router.use('/listings/scribbles', require('./scribbleRoutes'));
router.use('/audience', require('./audienceRoutes'));
router.use('/google-ads', require('./googleAdsRoutes'));
router.use('/bing-ads', require('./bingAdsRoutes'));

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
