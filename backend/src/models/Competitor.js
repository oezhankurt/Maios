const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Competitor = sequelize.define(
    'Competitor',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      productId: { type: DataTypes.UUID, allowNull: false },
      marketplace: {
        type: DataTypes.ENUM('amazon', 'ebay', 'kaufland', 'otto'),
        allowNull: false,
        defaultValue: 'amazon',
      },
      competitorAsin: { type: DataTypes.STRING },
      competitorTitle: { type: DataTypes.STRING },
      lastChecked: { type: DataTypes.DATE },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'competitors',
      indexes: [
        { fields: ['product_id'] },
        { fields: ['competitor_asin'] },
      ],
    }
  );

  return Competitor;
};
