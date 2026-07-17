const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PriceHistory = sequelize.define('PriceHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    marketplace: {
      type: DataTypes.ENUM('amazon', 'ebay', 'otto', 'kaufland'),
      defaultValue: 'amazon',
    },
    source: {
      type: DataTypes.ENUM('manual', 'reprice-rule', 'system'),
      defaultValue: 'system',
    },
    repricingRuleId: {
      type: DataTypes.UUID,
    },
    competitorPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    buyBoxPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  }, {
    timestamps: true,
  });

  return PriceHistory;
};
