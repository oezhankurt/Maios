const { Listing, ListingPublishLog } = require('../models');
const json2csv = require('json2csv');

class ListingExportService {
  static async exportListingsToCSV(userId, options = {}) {
    const { status, platforms, fields = 'all' } = options;

    const where = { userId };
    if (status) where.status = status;

    const listings = await Listing.findAll({
      where,
      include: [
        {
          association: 'publishLogs',
          attributes: ['platform', 'status', 'publishedAt'],
        },
      ],
    });

    const data = listings.map((listing) => {
      const record = {
        id: listing.id,
        productName: listing.productName,
        sku: listing.sku,
        ean: listing.ean,
        asin: listing.asin,
        basePrice: listing.basePrice,
        currency: listing.currency,
        status: listing.status,
        optimizationScore: listing.optimizationScore,
        createdAt: listing.createdAt,
        publishedAt: listing.lastPublishedAt,
      };

      if (fields === 'all' || fields.includes('description')) {
        record.description = listing.description;
      }

      if (fields === 'all' || fields.includes('keywords')) {
        record.keywords = Array.isArray(listing.keywords) ? listing.keywords.join('|') : '';
      }

      if (fields === 'all' || fields.includes('bulletPoints')) {
        record.bulletPoints = Array.isArray(listing.bulletPoints)
          ? listing.bulletPoints.join('|')
          : '';
      }

      const publishedPlatforms = listing.publishLogs
        .filter((log) => log.status === 'published')
        .map((log) => log.platform)
        .join(',');

      record.publishedPlatforms = publishedPlatforms;

      return record;
    });

    try {
      const csv = json2csv.parse(data);
      return csv;
    } catch (error) {
      throw new Error(`CSV conversion error: ${error.message}`);
    }
  }

  static async exportListingsToJSON(userId, options = {}) {
    const { status } = options;

    const where = { userId };
    if (status) where.status = status;

    const listings = await Listing.findAll({
      where,
      include: [
        {
          association: 'publishLogs',
          attributes: ['platform', 'status', 'publishedAt', 'externalId', 'externalUrl'],
        },
        {
          association: 'versions',
          attributes: ['versionNumber', 'changeType', 'createdAt'],
          limit: 5,
        },
      ],
    });

    return {
      exportedAt: new Date().toISOString(),
      totalListings: listings.length,
      listings: listings.map((listing) => ({
        id: listing.id,
        productName: listing.productName,
        description: listing.description,
        price: listing.basePrice,
        currency: listing.currency,
        sku: listing.sku,
        ean: listing.ean,
        asin: listing.asin,
        status: listing.status,
        optimizationScore: listing.optimizationScore,
        keywords: listing.keywords,
        bulletPoints: listing.bulletPoints,
        images: listing.images,
        publishedPlatforms: listing.publishLogs,
        versionHistory: listing.versions,
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      })),
    };
  }

  static async generatePDFReport(userId) {
    const listings = await Listing.findAll({
      where: { userId },
      attributes: [
        'id',
        'productName',
        'status',
        'optimizationScore',
        'basePrice',
        'createdAt',
      ],
    });

    const report = {
      title: 'Listing Management Report',
      generatedAt: new Date().toISOString(),
      userId,
      summary: {
        totalListings: listings.length,
        draft: listings.filter((l) => l.status === 'draft').length,
        published: listings.filter((l) => l.status === 'published').length,
        archived: listings.filter((l) => l.status === 'archived').length,
        scheduled: listings.filter((l) => l.status === 'scheduled').length,
        averageScore: Math.round(
          listings.reduce((sum, l) => sum + (l.optimizationScore || 0), 0) / listings.length
        ),
      },
      listings: listings.map((l) => ({
        productName: l.productName,
        status: l.status,
        score: l.optimizationScore,
        price: l.basePrice,
        createdAt: l.createdAt,
      })),
    };

    return report;
  }

  static async generatePerformanceReport(userId) {
    const publishLogs = await ListingPublishLog.findAll({
      include: [
        {
          association: 'listing',
          where: { userId },
          attributes: ['id', 'productName', 'optimizationScore'],
        },
      ],
    });

    const platformPerformance = {};
    for (const log of publishLogs) {
      if (!platformPerformance[log.platform]) {
        platformPerformance[log.platform] = {
          total: 0,
          successful: 0,
          failed: 0,
          inSync: 0,
          outOfSync: 0,
        };
      }

      platformPerformance[log.platform].total += 1;

      if (log.status === 'published') {
        platformPerformance[log.platform].successful += 1;
      } else if (log.status === 'failed') {
        platformPerformance[log.platform].failed += 1;
      }

      if (log.syncStatus === 'in-sync') {
        platformPerformance[log.platform].inSync += 1;
      } else if (log.syncStatus === 'out-of-sync') {
        platformPerformance[log.platform].outOfSync += 1;
      }
    }

    return {
      reportType: 'Performance Report',
      generatedAt: new Date().toISOString(),
      platformPerformance,
      totalPublishAttempts: publishLogs.length,
      totalSuccessful: publishLogs.filter((l) => l.status === 'published').length,
      totalFailed: publishLogs.filter((l) => l.status === 'failed').length,
    };
  }

  static async generateOptimizationReport(userId) {
    const listings = await Listing.findAll({
      where: { userId },
      attributes: [
        'id',
        'productName',
        'optimizationScore',
        'status',
        'optimizationReport',
      ],
    });

    const scoreRanges = {
      excellent: [],
      good: [],
      needsWork: [],
      poor: [],
    };

    for (const listing of listings) {
      const score = listing.optimizationScore || 0;

      if (score >= 80) {
        scoreRanges.excellent.push(listing);
      } else if (score >= 60) {
        scoreRanges.good.push(listing);
      } else if (score >= 40) {
        scoreRanges.needsWork.push(listing);
      } else {
        scoreRanges.poor.push(listing);
      }
    }

    return {
      reportType: 'Optimization Report',
      generatedAt: new Date().toISOString(),
      summary: {
        totalListings: listings.length,
        averageScore: Math.round(
          listings.reduce((sum, l) => sum + (l.optimizationScore || 0), 0) / listings.length
        ),
        unoptimized: listings.filter((l) => !l.optimizationScore).length,
      },
      distribution: {
        excellent: scoreRanges.excellent.length,
        good: scoreRanges.good.length,
        needsWork: scoreRanges.needsWork.length,
        poor: scoreRanges.poor.length,
      },
      details: scoreRanges,
    };
  }

  static async bulkExport(userId, format = 'csv', type = 'listings') {
    if (format === 'csv') {
      return this.exportListingsToCSV(userId);
    } else if (format === 'json') {
      return this.exportListingsToJSON(userId);
    } else if (format === 'report') {
      if (type === 'performance') {
        return this.generatePerformanceReport(userId);
      } else if (type === 'optimization') {
        return this.generateOptimizationReport(userId);
      }
      return this.generatePDFReport(userId);
    }

    throw new Error('Unsupported format');
  }
}

module.exports = ListingExportService;
