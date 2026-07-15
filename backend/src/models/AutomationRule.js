const { DataTypes } = require('sequelize');

/**
 * A Campaign-Mover automation rule — mirrors Adference's "Campaign Mover".
 * When a campaign matches the conditions, it is moved into the target Smart
 * Portfolio (so it inherits that portfolio's bidding strategy).
 *
 * conditions: [{ field, operator, value }]
 *   field    e.g. 'acos30', 'roas365', 'clicks30', 'campaignType', 'campaignName'
 *   operator numeric: gt|lt|gte|lte|eq  ·  string: contains|notContains|startsWith|
 *            notStartsWith|endsWith|notEndsWith  ·  enum: equals
 *   value    number | string
 * logic: 'all' (AND) | 'any' (OR)
 */
module.exports = (sequelize) => {
  const AutomationRule = sequelize.define(
    'AutomationRule',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      userId: { type: DataTypes.UUID, allowNull: false },
      targetPortfolioId: { type: DataTypes.UUID, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      active: { type: DataTypes.BOOLEAN, defaultValue: true },
      logic: { type: DataTypes.ENUM('all', 'any'), defaultValue: 'all' },
      conditions: { type: DataTypes.JSONB, defaultValue: [] },
      lastRunAt: { type: DataTypes.DATE },
    },
    {
      tableName: 'automation_rules',
      indexes: [{ fields: ['user_id'] }, { fields: ['target_portfolio_id'] }, { fields: ['active'] }],
    }
  );

  return AutomationRule;
};
