const listingAnalyticsService = require('../services/listingAnalyticsService');

exports.getComprehensiveAnalytics = async (req, res) => {
  try {
    const analytics = await listingAnalyticsService.getComprehensiveAnalytics(req.user.id);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Get Analytics Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPerformance = async (req, res) => {
  try {
    const { listingId } = req.query;

    const performance = await listingAnalyticsService.getListingPerformance(req.user.id, listingId);

    res.json({
      success: true,
      data: {
        performance,
      },
    });
  } catch (error) {
    console.error('Get Performance Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPlatformStats = async (req, res) => {
  try {
    const stats = await listingAnalyticsService.getPlatformStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get Platform Stats Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOptimizationStats = async (req, res) => {
  try {
    const stats = await listingAnalyticsService.getOptimizationStats(req.user.id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get Optimization Stats Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getStatusDistribution = async (req, res) => {
  try {
    const distribution = await listingAnalyticsService.getStatusDistribution(req.user.id);

    res.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error('Get Status Distribution Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPriceAnalysis = async (req, res) => {
  try {
    const analysis = await listingAnalyticsService.getPriceAnalysis(req.user.id);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Get Price Analysis Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPublishingTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const trends = await listingAnalyticsService.getPublishingTrends(req.user.id, parseInt(days));

    res.json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error('Get Publishing Trends Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSyncStatus = async (req, res) => {
  try {
    const syncStatus = await listingAnalyticsService.getSyncStatus(req.user.id);

    res.json({
      success: true,
      data: syncStatus,
    });
  } catch (error) {
    console.error('Get Sync Status Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
