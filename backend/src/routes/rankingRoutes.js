const express = require('express');
const rankingController = require('../controllers/rankingController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/product/:productId', rankingController.forProduct);
router.get('/:keywordId/history', rankingController.history);
router.get('/:keywordId/trend', rankingController.trend);

module.exports = router;
