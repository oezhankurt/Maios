const { ListingTemplate, Listing } = require('../models');
const { randomUUID } = require('crypto');

class ListingTemplateService {
  static async createTemplate(userId, templateData) {
    const {
      name, category, description, platforms, tags, templateContent
    } = templateData;

    if (!name) {
      throw new Error('Template name is required');
    }

    const template = await ListingTemplate.create({
      id: randomUUID(),
      userId,
      name,
      category,
      description,
      templateData: templateContent || {},
      platforms: platforms || ['amazon', 'ebay', 'kaufland', 'otto'],
      tags: tags || [],
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });

    return template;
  }

  static async updateTemplate(templateId, userId, updateData) {
    const template = await ListingTemplate.findByPk(templateId);
    if (!template || template.userId !== userId) {
      throw new Error('Template not found or access denied');
    }

    const {
      name, category, description, platforms, tags, templateContent
    } = updateData;

    if (name) template.name = name;
    if (category !== undefined) template.category = category;
    if (description !== undefined) template.description = description;
    if (platforms) template.platforms = platforms;
    if (tags) template.tags = tags;
    if (templateContent) template.templateData = templateContent;

    template.updatedAt = new Date();
    await template.save();

    return template;
  }

  static async getTemplate(templateId, userId) {
    const template = await ListingTemplate.findByPk(templateId);
    if (!template || (template.userId !== userId && !template.isPublic)) {
      throw new Error('Template not found or access denied');
    }

    template.usageCount += 1;
    await template.save();

    return template;
  }

  static async listUserTemplates(userId, options = {}) {
    const { category, tags, search, limit = 50, offset = 0 } = options;

    const where = { userId };
    if (category) where.category = category;

    const templates = await ListingTemplate.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
    });

    return {
      templates: templates.rows,
      total: templates.count,
      limit,
      offset,
    };
  }

  static async deleteTemplate(templateId, userId) {
    const template = await ListingTemplate.findByPk(templateId);
    if (!template || template.userId !== userId) {
      throw new Error('Template not found or access denied');
    }

    await template.destroy();
    return { success: true };
  }

  static async createListingFromTemplate(userId, templateId, listingOverrides = {}) {
    const template = await this.getTemplate(templateId, userId);

    const listingData = {
      ...template.templateData,
      ...listingOverrides,
      userId,
    };

    const listing = await Listing.create(listingData);
    return listing;
  }

  static async saveListingAsTemplate(userId, listingId, templateName, platforms = null) {
    const listing = await Listing.findByPk(listingId);
    if (!listing || listing.userId !== userId) {
      throw new Error('Listing not found or access denied');
    }

    const templateData = {
      productName: listing.productName,
      description: listing.description,
      basePrice: listing.basePrice,
      currency: listing.currency,
      keywords: listing.keywords,
      bulletPoints: listing.bulletPoints,
      images: listing.images,
    };

    const template = await ListingTemplate.create({
      id: randomUUID(),
      userId,
      name: templateName,
      category: listing.metadata?.category || 'General',
      description: `Template created from listing: ${listing.productName}`,
      templateData,
      platforms: platforms || listing.publishedPlatforms ? Object.keys(listing.publishedPlatforms) : ['amazon', 'ebay', 'kaufland', 'otto'],
      tags: [listing.productName],
      metadata: {
        sourceListingId: listingId,
        sourceListingName: listing.productName,
      },
    });

    return template;
  }

  static async getTemplateCategories(userId) {
    const templates = await ListingTemplate.findAll({
      where: { userId },
      attributes: ['category'],
      raw: true,
    });

    const categories = [...new Set(templates.map((t) => t.category).filter(Boolean))];
    return categories.sort();
  }

  static async duplicateTemplate(templateId, userId, newName) {
    const template = await ListingTemplate.findByPk(templateId);
    if (!template || template.userId !== userId) {
      throw new Error('Template not found or access denied');
    }

    const newTemplate = await ListingTemplate.create({
      id: randomUUID(),
      userId,
      name: newName || `${template.name} (Copy)`,
      category: template.category,
      description: template.description,
      templateData: JSON.parse(JSON.stringify(template.templateData)),
      platforms: template.platforms,
      tags: template.tags,
      metadata: {
        ...template.metadata,
        copiedFromId: templateId,
      },
    });

    return newTemplate;
  }
}

module.exports = ListingTemplateService;
