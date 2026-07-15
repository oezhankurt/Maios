const { DataTypes } = require('sequelize');

/**
 * A Smart Portfolio groups campaigns under a single bidding strategy — mirrors
 * Adference's Smart Portfolio: a target ACoS, a daily budget, and optional
 * Search-Term-Automation (STA) and Product-Bid-Optimization (PBO) toggles.
 */
module.exports = (sequelize) => {
  const SmartPortfolio = sequelize.define(
    'SmartPortfolio',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },

      // Bidding strategy: keep campaigns at/under this ACoS target.
      targetAcos: { type: DataTypes.DECIMAL(6, 2), defaultValue: 15 },
      dailyBudget: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      campaignTypes: { type: DataTypes.JSONB, defaultValue: ['sp'] }, // sp/sb/sd

      staEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }, // Search Term Automation
      pboEnabled: { type: DataTypes.BOOLEAN, defaultValue: false }, // Product Bid Optimization

      status: { type: DataTypes.ENUM('active', 'paused'), defaultValue: 'active' },
    },
    {
      tableName: 'smart_portfolios',
      indexes: [{ fields: ['user_id'] }, { fields: ['status'] }],
    }
  );

  return SmartPortfolio;
};
