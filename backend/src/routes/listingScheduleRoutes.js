const express = require('express');
const { authenticate } = require('../middleware/auth');
const listingScheduleController = require('../controllers/listingScheduleController');

const router = express.Router();

router.use(authenticate);

router.post('/:listingId/schedule', listingScheduleController.schedulePublish);
router.post('/:listingId/unschedule', listingScheduleController.unschedule);
router.get('/scheduled', listingScheduleController.getScheduledListings);
router.get('/stats', listingScheduleController.getStats);

module.exports = router;
