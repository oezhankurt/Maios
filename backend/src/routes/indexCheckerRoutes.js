const express = require('express');
const controller = require('../controllers/indexCheckerController');

const router = express.Router();

router.post('/check', controller.checkKeyword);
router.post('/batch', controller.checkKeywords);
router.post('/track', controller.trackRankings);

module.exports = router;
