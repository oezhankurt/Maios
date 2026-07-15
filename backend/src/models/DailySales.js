const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailySales = sequelize.define(
    'DailySales',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      // Config-driven marketplace id (see config/channels.js).
      marketplace: { type: DataTypes.STRING, allowNull: false, defaultValue: 'amazon' },
      saleDate: { type: DataTypes.DATEONLY, allowNull: false },

      unitsSold: { type: DataTypes.INTEGER, defaultValue: 0 },
      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      grossRevenue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },

      // Refunds (Erstattungen) — sellerboard-style tracking.
      refunds: { type: DataTypes.INTEGER, defaultValue: 0 },
      refundedAmount: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },

      referralFee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      fbaFee: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      ppcSpend: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },

      netRevenue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      profit: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      profitMargin: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
      acos: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
    },
    {
      tableName: 'daily_sales',
      indexes: [
        { fields: ['product_id'] },
        { fields: ['sale_date'] },
        { unique: true, fields: ['product_id', 'marketplace', 'sale_date'] },
      ],
    }
  );

  return DailySales;
};
