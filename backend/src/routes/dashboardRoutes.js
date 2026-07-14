const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/overview', dashboardController.overview);
router.get('/profit-chart', dashboardController.profitChart);
router.get('/top-products', dashboardController.topProducts);
router.get('/alerts', dashboardController.alerts);
router.patch('/alerts/:id/dismiss', dashboardController.dismissAlert);

module.exports = router;
