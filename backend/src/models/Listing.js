const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Listing = sequelize.define(
    'Listing',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      productName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING(3),
        defaultValue: 'EUR',
      },
      sku: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ean: {
        type: DataTypes.STRING(14),
        allowNull: true,
      },
      asin: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      keywords: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      bulletPoints: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      images: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM('draft', 'published', 'archived', 'scheduled'),
        defaultValue: 'draft',
      },
      publishedPlatforms: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: '{"amazon": {status: "published", externalId: "..."}, "ebay": {...}}',
      },
      optimizationScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      optimizationReport: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      scheduledPublishDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastModifiedBy: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      lastPublishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'listings',
      timestamps: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['status'] },
        { fields: ['sku'] },
        { fields: ['asin'] },
        { fields: ['createdAt'] },
      ],
    }
  );

  Listing.associate = (models) => {
    Listing.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    Listing.hasMany(models.ListingVersion, {
      foreignKey: 'listingId',
      as: 'versions',
    });

    Listing.hasMany(models.ListingPublishLog, {
      foreignKey: 'listingId',
      as: 'publishLogs',
    });
  };

  return Listing;
};
