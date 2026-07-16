const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const listingScheduleController = require('../controllers/listingScheduleController');

const router = express.Router();

router.use(verifyToken);

router.post('/:listingId/schedule', listingScheduleController.schedulePublish);
router.post('/:listingId/unschedule', listingScheduleController.unschedule);
router.get('/scheduled', listingScheduleController.getScheduledListings);
router.get('/stats', listingScheduleController.getStats);

module.exports = router;
