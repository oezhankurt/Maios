const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CompetitorPriceHistory = sequelize.define(
    'CompetitorPriceHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      competitorId: { type: DataTypes.UUID, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      priceDate: { type: DataTypes.DATEONLY, allowNull: false },
    },
    {
      tableName: 'competitor_price_history',
      indexes: [
        { fields: ['competitor_id'] },
        { fields: ['price_date'] },
        { unique: true, fields: ['competitor_id', 'price_date'] },
      ],
    }
  );

  return CompetitorPriceHistory;
};
