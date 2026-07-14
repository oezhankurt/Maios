const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/keywords', require('./keywordRoutes'));
router.use('/rankings', require('./rankingRoutes'));
router.use('/profit', require('./profitRoutes'));
router.use('/ppc', require('./ppcRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
