const { Listing, ListingVersion, ListingPublishLog, User } = require('../models');
const ApiError = require('../utils/ApiError');
const aiOptimizationService = require('./aiOptimizationService');

class ListingService {
  async createListing(userId, listingData) {
    const listing = await Listing.create({
      userId,
      productName: listingData.productName || listingData.name,
      description: listingData.description,
      basePrice: listingData.price,
      currency: listingData.currency || 'EUR',
      sku: listingData.sku,
      ean: listingData.ean,
      asin: listingData.asin,
      keywords: listingData.keywords || [],
      bulletPoints: listingData.bulletPoints || [],
      images: listingData.images || [],
      metadata: listingData.metadata || {},
    });

    // Erstelle erste Version
    await this.createVersion(listing.id, userId, listing.toJSON(), 'created', 'Initial version');

    return listing;
  }

  async updateListing(listingId, userId, updateData) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    const oldData = listing.toJSON();

    // Update listing
    await listing.update({
      productName: updateData.productName || listing.productName,
      description: updateData.description !== undefined ? updateData.description : listing.description,
      basePrice: updateData.price !== undefined ? updateData.price : listing.basePrice,
      sku: updateData.sku !== undefined ? updateData.sku : listing.sku,
      ean: updateData.ean !== undefined ? updateData.ean : listing.ean,
      asin: updateData.asin !== undefined ? updateData.asin : listing.asin,
      keywords: updateData.keywords !== undefined ? updateData.keywords : listing.keywords,
      bulletPoints: updateData.bulletPoints !== undefined ? updateData.bulletPoints : listing.bulletPoints,
      images: updateData.images !== undefined ? updateData.images : listing.images,
      lastModifiedBy: userId,
    });

    // Speichere Änderungen
    const changes = this.calculateChanges(oldData, listing.toJSON());

    await this.createVersion(
      listing.id,
      userId,
      listing.toJSON(),
      'edited',
      updateData.changeNotes || 'Manual edit'
    );

    return listing;
  }

  async optimizeListing(listingId, userId, platforms) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    const listingData = {
      name: listing.productName,
      title: listing.title,
      description: listing.description,
      price: listing.basePrice,
      keywords: listing.keywords,
      bulletPoints: listing.bulletPoints,
      sku: listing.sku,
      ean: listing.ean,
      asin: listing.asin,
      images: listing.images,
    };

    // Optimiere für jede Plattform
    const result = await Promise.all(
      platforms.map(async (platform) => {
        try {
          const optimized = await aiOptimizationService.optimizeListingForPlatform(
            listingData,
            platform
          );
          const score = aiOptimizationService.calculateOptimizationScore(optimized, platform);
          const recommendations = aiOptimizationService.getOptimizationRecommendations(
            optimized,
            platform
          );

          return {
            platform,
            optimized,
            score,
            recommendations,
            status: 'success',
          };
        } catch (error) {
          return {
            platform,
            error: error.message,
            status: 'failed',
          };
        }
      })
    );

    // Speichere durchschnittlichen Score
    const avgScore = Math.round(
      result
        .filter((r) => r.status === 'success')
        .reduce((sum, r) => sum + r.score, 0) / Math.max(result.filter((r) => r.status === 'success').length, 1)
    );

    const oldData = listing.toJSON();
    await listing.update({
      optimizationScore: avgScore,
      optimizationReport: result,
      lastModifiedBy: userId,
    });

    await this.createVersion(listing.id, userId, listing.toJSON(), 'optimized', 'AI Optimization');

    return {
      listing,
      optimizations: result,
      averageScore: avgScore,
    };
  }

  async publishListing(listingId, userId, platforms) {
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    const publishLogs = [];

    for (const platform of platforms) {
      // Erstelle Publish Log
      const log = await ListingPublishLog.create({
        listingId,
        platform,
        status: 'publishing',
      });

      try {
        // Simuliere Publishing (in echtem System würde hier die API zur Plattform aufgerufen)
        const externalId = `${platform}-${listingId.substring(0, 8)}-${Date.now()}`;
        const externalUrl = `https://${platform}.example.com/listing/${externalId}`;

        await log.update({
          status: 'published',
          externalId,
          externalUrl,
          publishedAt: new Date(),
          publishedData: listing.toJSON(),
        });

        publishLogs.push(log);
      } catch (error) {
        await log.update({
          status: 'failed',
          errorMessage: error.message,
          retryCount: log.retryCount + 1,
        });

        publishLogs.push(log);
      }
    }

    // Update Listing status
    const publishedPlatforms = {};
    const allPublished = publishLogs.every((log) => log.status === 'published');

    for (const log of publishLogs) {
      publishedPlatforms[log.platform] = {
        status: log.status,
        externalId: log.externalId,
        publishedAt: log.publishedAt,
      };
    }

    await listing.update({
      status: allPublished ? 'published' : 'published',
      publishedPlatforms,
      lastPublishedAt: new Date(),
    });

    await this.createVersion(listing.id, userId, listing.toJSON(), 'published', `Published to ${platforms.join(', ')}`);

    return {
      listing,
      publishLogs,
      successCount: publishLogs.filter((l) => l.status === 'published').length,
      failureCount: publishLogs.filter((l) => l.status === 'failed').length,
    };
  }

  async getListing(listingId, userId) {
    const listing = await Listing.findByPk(listingId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'email', 'username'] },
        { model: ListingVersion, as: 'versions', limit: 5, order: [['createdAt', 'DESC']] },
        { model: ListingPublishLog, as: 'publishLogs', order: [['createdAt', 'DESC']] },
      ],
    });

    if (!listing || listing.userId !== userId) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    return listing;
  }

  async listUserListings(userId, options = {}) {
    const { limit = 50, offset = 0, status = null } = options;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Listing.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [{ model: ListingPublishLog, as: 'publishLogs' }],
    });

    return {
      listings: rows,
      total: count,
      limit,
      offset,
    };
  }

  async deleteListing(listingId, userId) {
    const listing = await Listing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    await listing.destroy();

    return { success: true, message: 'Listing gelöscht' };
  }

  async createVersion(listingId, userId, data, changeType, changeNotes) {
    const latestVersion = await ListingVersion.findOne({
      where: { listingId },
      order: [['versionNumber', 'DESC']],
    });

    const versionNumber = (latestVersion?.versionNumber || 0) + 1;

    return await ListingVersion.create({
      listingId,
      versionNumber,
      data,
      changeType,
      changedBy: userId,
      changeNotes,
    });
  }

  async getListingVersions(listingId, userId) {
    const listing = await Listing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    return await ListingVersion.findAll({
      where: { listingId },
      order: [['createdAt', 'DESC']],
    });
  }

  async restoreVersion(listingId, userId, versionId) {
    const listing = await Listing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw ApiError.notFound('Listing nicht gefunden');
    }

    const version = await ListingVersion.findByPk(versionId);
    if (!version || version.listingId !== listingId) {
      throw ApiError.notFound('Version nicht gefunden');
    }

    const restoredData = version.data;

    await listing.update(restoredData);
    await this.createVersion(listing.id, userId, listing.toJSON(), 'restored', `Restored from v${version.versionNumber}`);

    return listing;
  }

  calculateChanges(oldData, newData) {
    const changes = {};

    for (const key in newData) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes[key] = {
          from: oldData[key],
          to: newData[key],
        };
      }
    }

    return changes;
  }
}

module.exports = new ListingService();
