const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const listingExportController = require('../controllers/listingExportController');

const router = express.Router();

router.use(verifyToken);

router.get('/csv', listingExportController.exportCSV);
router.get('/json', listingExportController.exportJSON);
router.get('/report/pdf', listingExportController.getPDFReport);
router.get('/report/performance', listingExportController.getPerformanceReport);
router.get('/report/optimization', listingExportController.getOptimizationReport);

module.exports = router;
