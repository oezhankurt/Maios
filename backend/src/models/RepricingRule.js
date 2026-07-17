const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RepricingRule = sequelize.define('RepricingRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    strategy: {
      type: DataTypes.ENUM('sales-based', 'time-based', 'competitor-based', 'margin-based'),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Price Range
    minPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    maxPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currentPrice: {
      type: DataTypes.DECIMAL(10, 2),
    },
    // Strategy-specific config
    config: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    // Performance metrics
    appliedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lastApplied: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  }, {
    timestamps: true,
  });

  return RepricingRule;
};
