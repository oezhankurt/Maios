const { AmazonListing, Product } = require('../models');
const { randomUUID } = require('crypto');

class AmazonListingService {
  static async createListing(userId, listingData) {
    const {
      sku, title, price, productId, ...otherData
    } = listingData;

    if (!sku || !title || !price) {
      throw new Error('Missing required fields: sku, title, price');
    }

    const listing = await AmazonListing.create({
      id: randomUUID(),
      userId,
      sku,
      title,
      price: parseFloat(price),
      productId,
      ...otherData,
    });

    return listing;
  }

  static async getListing(listingId, userId) {
    const listing = await AmazonListing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw new Error('Listing not found or access denied');
    }
    return listing;
  }

  static async listListings(userId, filters = {}) {
    const where = { userId };
    if (filters.status) where.status = filters.status;
    if (filters.productId) where.productId = filters.productId;

    return await AmazonListing.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateListing(listingId, userId, updateData) {
    const listing = await this.getListing(listingId, userId);

    Object.assign(listing, updateData);
    await listing.save();
    return listing;
  }

  static async deleteListing(listingId, userId) {
    const listing = await this.getListing(listingId, userId);
    await listing.destroy();
    return { success: true };
  }

  static async publishListing(listingId, userId) {
    const listing = await this.getListing(listingId, userId);

    // Validate required fields
    const requiredFields = ['asin', 'title', 'bulletPoints', 'price', 'stock'];
    for (const field of requiredFields) {
      if (!listing[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    listing.status = 'active';
    listing.publishedAt = new Date();
    await listing.save();

    return { success: true, publishedAt: listing.publishedAt };
  }

  static async validateListing(listing) {
    const errors = [];

    if (!listing.title || listing.title.length < 20) {
      errors.push('Title must be at least 20 characters');
    }
    if (listing.title && listing.title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }

    if (!listing.bulletPoints || listing.bulletPoints.length < 3) {
      errors.push('At least 3 bullet points required');
    }

    if (!listing.price || listing.price <= 0) {
      errors.push('Price must be greater than 0');
    }

    if (!listing.images || listing.images.length < 1) {
      errors.push('At least 1 image required');
    }

    if (!listing.category) {
      errors.push('Category is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  static async getListingPreview(listingId, userId) {
    const listing = await this.getListing(listingId, userId);
    const validation = await this.validateListing(listing);

    return {
      ...listing.toJSON(),
      validation,
    };
  }

  static async duplicateListing(listingId, userId) {
    const listing = await this.getListing(listingId, userId);

    const newListing = await AmazonListing.create({
      id: randomUUID(),
      userId,
      ...listing.toJSON(),
      id: randomUUID(),
      sku: `${listing.sku}_COPY_${Date.now()}`,
      asin: null,
      status: 'draft',
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newListing;
  }

  static async searchListings(userId, query) {
    return await AmazonListing.findAll({
      where: {
        userId,
        [require('sequelize').Op.or]: [
          { title: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { sku: { [require('sequelize').Op.iLike]: `%${query}%` } },
          { asin: { [require('sequelize').Op.iLike]: `%${query}%` } },
        ],
      },
    });
  }
}

module.exports = AmazonListingService;
