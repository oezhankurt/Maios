const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: { type: DataTypes.UUID, allowNull: false },
      asin: { type: DataTypes.STRING },
      ean: { type: DataTypes.STRING },
      sku: { type: DataTypes.STRING },
      title: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING },
      imageUrl: { type: DataTypes.STRING },

      // Listing content (for keyword-gap / listing-score analysis).
      bullets: { type: DataTypes.JSONB, defaultValue: [] },
      description: { type: DataTypes.TEXT },
      backendKeywords: { type: DataTypes.TEXT },

      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      costPerUnit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

      // Inventory levels (Lager) — FBA (Amazon-fulfilled) and FBM (merchant).
      fbaStock: { type: DataTypes.INTEGER, defaultValue: 0 },
      fbmStock: { type: DataTypes.INTEGER, defaultValue: 0 },

      status: {
        type: DataTypes.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active',
      },
    },
    {
      tableName: 'products',
      indexes: [
        { fields: ['user_id'] },
        { fields: ['asin'] },
        { fields: ['status'] },
      ],
    }
  );

  return Product;
};
