const { Listing, ListingVersion, ListingPublishLog } = require('../models');
const listingService = require('./listingService');
const aiOptimizationService = require('./aiOptimizationService');

class BulkListingsService {
  static async createListingsFromData(userId, listingsData) {
    const results = {
      successful: [],
      failed: [],
      total: listingsData.length,
    };

    for (const listingData of listingsData) {
      try {
        const listing = await listingService.createListing(userId, listingData);
        results.successful.push({
          id: listing.id,
          productName: listing.productName,
          status: 'created',
        });
      } catch (error) {
        results.failed.push({
          productName: listingData.productName,
          error: error.message,
        });
      }
    }

    return results;
  }

  static async bulkOptimize(userId, listingIds, platforms) {
    const results = {
      successful: [],
      failed: [],
      total: listingIds.length,
      platformsOptimized: platforms,
      averageScore: 0,
    };

    let totalScore = 0;

    for (const listingId of listingIds) {
      try {
        const listing = await listingService.optimizeListing(listingId, userId, platforms);
        results.successful.push({
          id: listing.id,
          productName: listing.productName,
          optimizationScore: listing.optimizationScore,
        });
        totalScore += listing.optimizationScore || 0;
      } catch (error) {
        results.failed.push({
          listingId,
          error: error.message,
        });
      }
    }

    results.averageScore = results.successful.length > 0
      ? Math.round(totalScore / results.successful.length)
      : 0;

    return results;
  }

  static async bulkPublish(userId, listingIds, platforms) {
    const results = {
      successful: [],
      failed: [],
      total: listingIds.length,
      platformsPublished: platforms,
      publishedCount: 0,
    };

    for (const listingId of listingIds) {
      try {
        const listing = await listingService.publishListing(listingId, userId, platforms);
        results.successful.push({
          id: listing.id,
          productName: listing.productName,
          publishedPlatforms: platforms,
        });
        results.publishedCount += platforms.length;
      } catch (error) {
        results.failed.push({
          listingId,
          error: error.message,
        });
      }
    }

    return results;
  }

  static async bulkDelete(userId, listingIds) {
    const results = {
      successful: [],
      failed: [],
      total: listingIds.length,
      deletedCount: 0,
    };

    for (const listingId of listingIds) {
      try {
        await listingService.deleteListing(listingId, userId);
        results.successful.push({ id: listingId });
        results.deletedCount += 1;
      } catch (error) {
        results.failed.push({
          listingId,
          error: error.message,
        });
      }
    }

    return results;
  }

  static async bulkUpdateStatus(userId, listingIds, newStatus) {
    const validStatuses = ['draft', 'published', 'archived', 'scheduled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }

    const results = {
      successful: [],
      failed: [],
      total: listingIds.length,
      newStatus,
      updatedCount: 0,
    };

    for (const listingId of listingIds) {
      try {
        const listing = await Listing.findByPk(listingId);
        if (!listing || listing.userId !== userId) {
          throw new Error('Listing not found or access denied');
        }

        listing.status = newStatus;
        await listing.save();

        results.successful.push({
          id: listing.id,
          productName: listing.productName,
          newStatus,
        });
        results.updatedCount += 1;
      } catch (error) {
        results.failed.push({
          listingId,
          error: error.message,
        });
      }
    }

    return results;
  }

  static async getImportProgress(jobId) {
    return {
      jobId,
      status: 'completed',
      progress: 100,
      message: 'Use bulkOptimize or bulkPublish endpoints for real-time tracking',
    };
  }

  static async validateListingsForPublish(userId, listingIds, platforms) {
    const results = {
      canPublish: true,
      warnings: [],
      errors: [],
      totalListings: listingIds.length,
    };

    for (const listingId of listingIds) {
      try {
        const listing = await Listing.findByPk(listingId);
        if (!listing || listing.userId !== userId) {
          results.errors.push({ listingId, error: 'Listing not found' });
          results.canPublish = false;
          continue;
        }

        if (!listing.productName) {
          results.errors.push({ listingId, error: 'Missing product name' });
          results.canPublish = false;
        }

        if (!listing.basePrice) {
          results.errors.push({ listingId, error: 'Missing price' });
          results.canPublish = false;
        }

        if (listing.optimizationScore < 50) {
          results.warnings.push({
            listingId,
            warning: `Low optimization score (${listing.optimizationScore}%), consider optimizing before publishing`,
          });
        }

        if (!listing.description) {
          results.warnings.push({
            listingId,
            warning: 'Missing description',
          });
        }
      } catch (error) {
        results.errors.push({ listingId, error: error.message });
        results.canPublish = false;
      }
    }

    return results;
  }
}

module.exports = BulkListingsService;
