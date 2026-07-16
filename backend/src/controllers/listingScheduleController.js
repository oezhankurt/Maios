const listingScheduleService = require('../services/listingScheduleService');

exports.schedulePublish = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { platforms, scheduledDate } = req.body;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'platforms array required' });
    }

    if (!scheduledDate) {
      return res.status(400).json({ success: false, error: 'scheduledDate required' });
    }

    const listing = await listingScheduleService.schedulePublish(
      listingId,
      req.user.id,
      platforms,
      scheduledDate
    );

    res.json({
      success: true,
      listing: {
        id: listing.id,
        productName: listing.productName,
        status: listing.status,
        scheduledPublishDate: listing.scheduledPublishDate,
      },
    });
  } catch (error) {
    console.error('Schedule Publish Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.unschedule = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await listingScheduleService.unschedule(listingId, req.user.id);

    res.json({
      success: true,
      listing: {
        id: listing.id,
        productName: listing.productName,
        status: listing.status,
      },
    });
  } catch (error) {
    console.error('Unschedule Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getScheduledListings = async (req, res) => {
  try {
    const listings = await listingScheduleService.getScheduledListings(req.user.id);

    res.json({
      success: true,
      data: {
        listings,
        count: listings.length,
      },
    });
  } catch (error) {
    console.error('Get Scheduled Listings Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await listingScheduleService.getPublishingStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
