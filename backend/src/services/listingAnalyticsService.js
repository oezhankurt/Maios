const { Listing, ListingPublishLog } = require('../models');

class ListingAnalyticsService {
  static async getListingPerformance(userId, listingId = null) {
    const where = { userId };
    if (listingId) where.id = listingId;

    const listings = await Listing.findAll({
      where,
      attributes: [
        'id',
        'productName',
        'status',
        'optimizationScore',
        'basePrice',
        'createdAt',
        'publishedPlatforms',
      ],
    });

    const performance = [];

    for (const listing of listings) {
      const publishLogs = await ListingPublishLog.findAll({
        where: { listingId: listing.id },
      });

      const platformStats = {};
      for (const log of publishLogs) {
        if (!platformStats[log.platform]) {
          platformStats[log.platform] = {
            status: log.status,
            publishedAt: log.publishedAt,
            externalId: log.externalId,
            externalUrl: log.externalUrl,
            syncStatus: log.syncStatus,
            retryCount: log.retryCount,
          };
        }
      }

      performance.push({
        listingId: listing.id,
        productName: listing.productName,
        status: listing.status,
        price: listing.basePrice,
        optimizationScore: listing.optimizationScore,
        createdAt: listing.createdAt,
        platformStats,
        totalPlatforms: Object.keys(platformStats).length,
        successfulPlatforms: Object.values(platformStats).filter((s) => s.status === 'published').length,
      });
    }

    return performance;
  }

  static async getPlatformStats(userId) {
    const publishLogs = await ListingPublishLog.findAll({
      include: [
        {
          association: 'listing',
          where: { userId },
          attributes: ['id', 'productName'],
        },
      ],
    });

    const platformStats = {
      amazon: { total: 0, published: 0, failed: 0, inSync: 0 },
      ebay: { total: 0, published: 0, failed: 0, inSync: 0 },
      kaufland: { total: 0, published: 0, failed: 0, inSync: 0 },
      otto: { total: 0, published: 0, failed: 0, inSync: 0 },
    };

    for (const log of publishLogs) {
      if (!platformStats[log.platform]) {
        platformStats[log.platform] = { total: 0, published: 0, failed: 0, inSync: 0 };
      }

      platformStats[log.platform].total += 1;

      if (log.status === 'published') {
        platformStats[log.platform].published += 1;
      } else if (log.status === 'failed') {
        platformStats[log.platform].failed += 1;
      }

      if (log.syncStatus === 'in-sync') {
        platformStats[log.platform].inSync += 1;
      }
    }

    return platformStats;
  }

  static async getOptimizationStats(userId) {
    const listings = await Listing.findAll({
      where: { userId },
      attributes: ['optimizationScore', 'status'],
    });

    const scores = listings.map((l) => l.optimizationScore || 0);
    const average = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const max = Math.max(...scores, 0);
    const min = Math.min(...scores, 0);

    const distribution = {
      excellent: scores.filter((s) => s >= 80).length,
      good: scores.filter((s) => s >= 60 && s < 80).length,
      needsWork: scores.filter((s) => s >= 40 && s < 60).length,
      poor: scores.filter((s) => s < 40).length,
    };

    const unoptimized = listings.filter((l) => l.optimizationScore === 0 || !l.optimizationScore).length;

    return {
      average,
      max,
      min,
      total: listings.length,
      unoptimized,
      distribution,
    };
  }

  static async getStatusDistribution(userId) {
    const listings = await Listing.findAll({
      where: { userId },
      attributes: ['status'],
      raw: true,
    });

    const distribution = {
      draft: listings.filter((l) => l.status === 'draft').length,
      published: listings.filter((l) => l.status === 'published').length,
      archived: listings.filter((l) => l.status === 'archived').length,
      scheduled: listings.filter((l) => l.status === 'scheduled').length,
    };

    return {
      ...distribution,
      total: listings.length,
    };
  }

  static async getPriceAnalysis(userId) {
    const listings = await Listing.findAll({
      where: { userId },
      attributes: ['basePrice', 'productName', 'publishedPlatforms'],
    });

    const prices = listings.map((l) => parseFloat(l.basePrice) || 0).filter((p) => p > 0);
    const average = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length * 100) / 100 : 0;
    const min = prices.length > 0 ? Math.min(...prices) : 0;
    const max = prices.length > 0 ? Math.max(...prices) : 0;

    const priceBrackets = {
      under10: listings.filter((l) => l.basePrice < 10).length,
      from10to50: listings.filter((l) => l.basePrice >= 10 && l.basePrice < 50).length,
      from50to100: listings.filter((l) => l.basePrice >= 50 && l.basePrice < 100).length,
      from100to500: listings.filter((l) => l.basePrice >= 100 && l.basePrice < 500).length,
      over500: listings.filter((l) => l.basePrice >= 500).length,
    };

    return {
      average,
      min,
      max,
      total: listings.length,
      priceBrackets,
    };
  }

  static async getPublishingTrends(userId, days = 30) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);

    const logs = await ListingPublishLog.findAll({
      include: [
        {
          association: 'listing',
          where: { userId },
          attributes: ['id'],
        },
      ],
      where: {
        createdAt: { [require('sequelize').Op.gte]: sinceDate },
      },
      attributes: ['createdAt', 'status', 'platform'],
    });

    const trends = {};
    for (const log of logs) {
      const dateKey = log.createdAt.toISOString().split('T')[0];
      if (!trends[dateKey]) {
        trends[dateKey] = { total: 0, successful: 0, failed: 0 };
      }

      trends[dateKey].total += 1;
      if (log.status === 'published') {
        trends[dateKey].successful += 1;
      } else if (log.status === 'failed') {
        trends[dateKey].failed += 1;
      }
    }

    return {
      startDate: sinceDate.toISOString().split('T')[0],
      trends,
      totalPublished: logs.filter((l) => l.status === 'published').length,
      totalFailed: logs.filter((l) => l.status === 'failed').length,
    };
  }

  static async getSyncStatus(userId) {
    const logs = await ListingPublishLog.findAll({
      include: [
        {
          association: 'listing',
          where: { userId },
          attributes: ['id'],
        },
      ],
      attributes: ['syncStatus'],
      raw: true,
    });

    return {
      inSync: logs.filter((l) => l.syncStatus === 'in-sync').length,
      outOfSync: logs.filter((l) => l.syncStatus === 'out-of-sync').length,
      needsReview: logs.filter((l) => l.syncStatus === 'needs-review').length,
      total: logs.length,
    };
  }

  static async getComprehensiveAnalytics(userId) {
    const [
      performanceData,
      platformStats,
      optimizationStats,
      statusDist,
      priceAnalysis,
      publishingTrends,
      syncStatus,
    ] = await Promise.all([
      this.getListingPerformance(userId),
      this.getPlatformStats(userId),
      this.getOptimizationStats(userId),
      this.getStatusDistribution(userId),
      this.getPriceAnalysis(userId),
      this.getPublishingTrends(userId, 30),
      this.getSyncStatus(userId),
    ]);

    return {
      summary: {
        totalListings: statusDist.total,
        successRate: this.calculateSuccessRate(performanceData),
      },
      performance: performanceData,
      platformStats,
      optimizationStats,
      statusDistribution: statusDist,
      priceAnalysis,
      publishingTrends,
      syncStatus,
      generatedAt: new Date().toISOString(),
    };
  }

  static calculateSuccessRate(performanceData) {
    if (performanceData.length === 0) return 0;

    const successful = performanceData.filter((p) => p.status === 'published' || p.successfulPlatforms > 0).length;
    return Math.round((successful / performanceData.length) * 100);
  }
}

module.exports = ListingAnalyticsService;
