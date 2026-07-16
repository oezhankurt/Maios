const express = require('express');
const controller = require('../controllers/listingAnalyzerController');

const router = express.Router();

router.post('/main', controller.analyzeMain);
router.post('/competitors', controller.addCompetitors);

module.exports = router;
