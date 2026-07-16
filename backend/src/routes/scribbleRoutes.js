const express = require('express');
const controller = require('../controllers/scribbleController');

const router = express.Router();

router.post('/title', controller.optimizeTitle);
router.post('/bullets', controller.optimizeBullets);
router.post('/description', controller.optimizeDescription);
router.post('/analyze', controller.analyzeContent);

module.exports = router;
