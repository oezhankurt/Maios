const express = require('express');
const profitController = require('../controllers/profitController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Static path first so it is not captured by the :productId routes.
router.get('/chart', profitController.chart);
router.get('/daily/:productId', profitController.daily);
router.get('/monthly/:productId', profitController.monthly);
router.get('/yearly/:productId', profitController.yearly);
router.get('/forecast/:productId', profitController.forecast);

module.exports = router;
