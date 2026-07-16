const express = require('express');
const controller = require('../controllers/audienceController');

const router = express.Router();

router.get('/meta', controller.getMetadata);
router.get('/', controller.getSurveys);
router.get('/:id', controller.getSurvey);
router.post('/', controller.createSurvey);
router.post('/:id/launch', controller.launchSurvey);
router.get('/:id/insights', controller.generateInsights);

module.exports = router;
