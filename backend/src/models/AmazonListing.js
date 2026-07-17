const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AmazonListing = sequelize.define('AmazonListing', {
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
    },
    // Basic Info
    asin: {
      type: DataTypes.STRING,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    // Descriptions
    bulletPoints: {
      type: DataTypes.JSON,
      defaultValue: ['', '', '', '', ''],
    },
    description: {
      type: DataTypes.TEXT,
    },
    keywords: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Pricing & Stock
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'EUR',
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    // Categorization
    category: {
      type: DataTypes.STRING,
    },
    subcategory: {
      type: DataTypes.STRING,
    },
    // Images
    images: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    mainImage: {
      type: DataTypes.STRING,
    },
    // Attributes (Color, Size, Material, Brand, etc.)
    attributes: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    // Physical Properties
    weight: {
      type: DataTypes.DECIMAL(8, 2),
    },
    weightUnit: {
      type: DataTypes.STRING(5),
      defaultValue: 'kg',
    },
    dimensions: {
      type: DataTypes.JSON,
      defaultValue: { length: 0, width: 0, height: 0, unit: 'cm' },
    },
    // IDs & Certifications
    eanUpc: {
      type: DataTypes.STRING,
    },
    originCountry: {
      type: DataTypes.STRING,
    },
    certifications: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    // Status
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'inactive', 'archived'),
      defaultValue: 'draft',
    },
    // Metadata
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    publishedAt: {
      type: DataTypes.DATE,
    },
    lastSyncedAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['productId'] },
      { fields: ['asin'] },
      { fields: ['sku'] },
      { fields: ['status'] },
    ],
  });

  return AmazonListing;
};
