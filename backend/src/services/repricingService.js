const { RepricingRule, PriceHistory, Product } = require('../models');
const { randomUUID } = require('crypto');

class RepricingService {
  static async createRule(userId, ruleData) {
    const {
      productId, name, strategy, minPrice, maxPrice, config, isActive
    } = ruleData;

    if (!productId || !name || !strategy) {
      throw new Error('Missing required fields: productId, name, strategy');
    }

    const rule = await RepricingRule.create({
      id: randomUUID(),
      userId,
      productId,
      name,
      strategy,
      minPrice: parseFloat(minPrice),
      maxPrice: parseFloat(maxPrice),
      config: config || {},
      isActive: isActive !== false,
    });

    return rule;
  }

  static async getRule(ruleId, userId) {
    const rule = await RepricingRule.findByPk(ruleId);
    if (!rule || rule.userId !== userId) {
      throw new Error('Rule not found or access denied');
    }
    return rule;
  }

  static async listRules(userId, productId = null) {
    const where = { userId };
    if (productId) where.productId = productId;

    return await RepricingRule.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });
  }

  static async updateRule(ruleId, userId, updateData) {
    const rule = await this.getRule(ruleId, userId);

    const { name, strategy, minPrice, maxPrice, config, isActive } = updateData;

    if (name) rule.name = name;
    if (strategy) rule.strategy = strategy;
    if (minPrice) rule.minPrice = parseFloat(minPrice);
    if (maxPrice) rule.maxPrice = parseFloat(maxPrice);
    if (config) rule.config = { ...rule.config, ...config };
    if (isActive !== undefined) rule.isActive = isActive;

    await rule.save();
    return rule;
  }

  static async deleteRule(ruleId, userId) {
    const rule = await this.getRule(ruleId, userId);
    await rule.destroy();
    return { success: true };
  }

  static async applyRule(ruleId, userId) {
    const rule = await this.getRule(ruleId, userId);

    if (!rule.isActive) {
      throw new Error('Rule is not active');
    }

    const product = await Product.findByPk(rule.productId);
    if (!product || product.userId !== userId) {
      throw new Error('Product not found or access denied');
    }

    let newPrice = product.basePrice;

    // Apply strategy logic
    switch (rule.strategy) {
      case 'margin-based':
        newPrice = this.calculateMarginPrice(product, rule.config);
        break;
      case 'competitor-based':
        newPrice = await this.calculateCompetitorPrice(product, rule.config);
        break;
      case 'sales-based':
        newPrice = await this.calculateSalesPrice(product, rule.config);
        break;
      case 'time-based':
        newPrice = this.calculateTimeBasedPrice(product, rule.config);
        break;
    }

    // Enforce min/max bounds
    newPrice = Math.max(rule.minPrice, Math.min(rule.maxPrice, newPrice));

    // Record price change
    await PriceHistory.create({
      id: randomUUID(),
      productId: rule.productId,
      price: newPrice,
      repricingRuleId: rule.id,
      source: 'reprice-rule',
      marketplace: 'amazon',
    });

    // Update product price
    product.basePrice = newPrice;
    await product.save();

    // Update rule stats
    rule.currentPrice = newPrice;
    rule.appliedCount += 1;
    rule.lastApplied = new Date();
    await rule.save();

    return {
      productId: rule.productId,
      oldPrice: product.basePrice,
      newPrice,
      rule: rule.name,
      appliedAt: new Date(),
    };
  }

  static calculateMarginPrice(product, config) {
    const { targetMargin, cost } = config;
    if (!cost || !targetMargin) return product.basePrice;
    return cost / (1 - targetMargin / 100);
  }

  static async calculateCompetitorPrice(product, config) {
    const { undercutPercent = 5 } = config;
    // In real implementation, fetch competitor prices from API
    const baseCompetitorPrice = product.basePrice * 1.1;
    return baseCompetitorPrice * (1 - undercutPercent / 100);
  }

  static async calculateSalesPrice(product, config) {
    const { salesThreshold, increase, decrease } = config;
    // In real implementation, fetch sales data
    const recentSales = Math.random() * 20; // Mock data

    if (recentSales > salesThreshold) {
      return product.basePrice * (1 + increase / 100);
    }
    return product.basePrice * (1 - decrease / 100);
  }

  static calculateTimeBasedPrice(product, config) {
    const { peakHours, peakPrice, offPeakPrice } = config;
    const now = new Date();
    const hour = now.getHours();

    if (peakHours && peakHours.includes(hour)) {
      return peakPrice;
    }
    return offPeakPrice || product.basePrice;
  }

  static async getPriceHistory(productId, userId, days = 30) {
    const product = await Product.findByPk(productId);
    if (!product || product.userId !== userId) {
      throw new Error('Product not found or access denied');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await PriceHistory.findAll({
      where: {
        productId,
        createdAt: { [require('sequelize').Op.gte]: startDate },
      },
      order: [['createdAt', 'ASC']],
    });
  }

  static async getPricingStats(userId, productId = null) {
    const where = { userId };
    if (productId) where.productId = productId;

    const rules = await RepricingRule.findAll({ where });
    const activeRules = rules.filter(r => r.isActive);

    return {
      totalRules: rules.length,
      activeRules: activeRules.length,
      strategies: rules.reduce((acc, r) => {
        acc[r.strategy] = (acc[r.strategy] || 0) + 1;
        return acc;
      }, {}),
      totalApplied: rules.reduce((sum, r) => sum + r.appliedCount, 0),
    };
  }
}

module.exports = RepricingService;
