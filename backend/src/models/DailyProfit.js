const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DailyProfit = sequelize.define(
    'DailyProfit',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      profitDate: { type: DataTypes.DATEONLY, allowNull: false },

      totalRevenue: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      totalCosts: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      totalProfit: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      profitMargin: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
      avgAcos: { type: DataTypes.DECIMAL(6, 2), defaultValue: 0 },
      unitsSold: { type: DataTypes.INTEGER, defaultValue: 0 },
    },
    {
      tableName: 'daily_profits',
      indexes: [
        { fields: ['product_id'] },
        { fields: ['profit_date'] },
        { unique: true, fields: ['product_id', 'profit_date'] },
      ],
    }
  );

  return DailyProfit;
};
