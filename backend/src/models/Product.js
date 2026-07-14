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
      title: { type: DataTypes.STRING, allowNull: false },
      category: { type: DataTypes.STRING },

      price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      costPerUnit: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },

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
