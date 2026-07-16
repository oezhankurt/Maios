const { Listing, ListingPublishLog } = require('../models');
const listingService = require('./listingService');

class ListingScheduleService {
  static async schedulePublish(listingId, userId, platforms, scheduledDate) {
    const listing = await Listing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw new Error('Listing not found or access denied');
    }

    if (new Date(scheduledDate) <= new Date()) {
      throw new Error('Scheduled date must be in the future');
    }

    listing.status = 'scheduled';
    listing.scheduledPublishDate = new Date(scheduledDate);
    listing.metadata = listing.metadata || {};
    listing.metadata.scheduledPlatforms = platforms;
    await listing.save();

    return listing;
  }

  static async unschedule(listingId, userId) {
    const listing = await Listing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw new Error('Listing not found or access denied');
    }

    listing.status = 'draft';
    listing.scheduledPublishDate = null;
    await listing.save();

    return listing;
  }

  static async getScheduledListings(userId) {
    const listings = await Listing.findAll({
      where: {
        userId,
        status: 'scheduled',
      },
      order: [['scheduledPublishDate', 'ASC']],
    });

    return listings.map((listing) => ({
      id: listing.id,
      productName: listing.productName,
      scheduledPublishDate: listing.scheduledPublishDate,
      platforms: listing.metadata?.scheduledPlatforms || [],
      optimizationScore: listing.optimizationScore,
    }));
  }

  static async processScheduledPublishing() {
    const now = new Date();

    const scheduledListings = await Listing.findAll({
      where: {
        status: 'scheduled',
      },
    });

    const results = [];

    for (const listing of scheduledListings) {
      if (listing.scheduledPublishDate <= now) {
        try {
          const platforms = listing.metadata?.scheduledPlatforms || [];
          await listingService.publishListing(listing.id, listing.userId, platforms);

          results.push({
            id: listing.id,
            productName: listing.productName,
            status: 'published',
          });
        } catch (error) {
          results.push({
            id: listing.id,
            productName: listing.productName,
            status: 'failed',
            error: error.message,
          });
        }
      }
    }

    return results;
  }

  static async getPublishingStats(userId) {
    const listings = await Listing.findAll({ where: { userId } });
    const scheduled = listings.filter((l) => l.status === 'scheduled').length;
    const published = listings.filter((l) => l.status === 'published').length;
    const draft = listings.filter((l) => l.status === 'draft').length;
    const archived = listings.filter((l) => l.status === 'archived').length;

    const avgScore = listings.length > 0
      ? Math.round(
        listings.reduce((sum, l) => sum + (l.optimizationScore || 0), 0) / listings.length
      )
      : 0;

    return {
      total: listings.length,
      scheduled,
      published,
      draft,
      archived,
      averageOptimizationScore: avgScore,
      totalPublishedToday: await this.getPublishedTodayCount(userId),
    };
  }

  static async getPublishedTodayCount(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await ListingPublishLog.findAll({
      include: [
        {
          association: 'listing',
          where: { userId },
          attributes: ['id'],
        },
      ],
      where: {
        publishedAt: { [require('sequelize').Op.gte]: today },
        status: 'published',
      },
    });

    return logs.length;
  }
}

module.exports = ListingScheduleService;
