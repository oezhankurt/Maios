const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ListingPublishLog = sequelize.define(
    'ListingPublishLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      listingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id',
        },
      },
      platform: {
        type: DataTypes.ENUM('amazon', 'ebay', 'kaufland', 'otto'),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'publishing', 'published', 'failed', 'unpublished'),
        defaultValue: 'pending',
      },
      externalId: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'ID from external platform (ASIN, eBay item ID, etc)',
      },
      externalUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL to listing on external platform',
      },
      publishedData: {
        type: DataTypes.JSON,
        defaultValue: {},
        comment: 'Data exactly as published on platform',
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      errorDetails: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      unpublishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      syncStatus: {
        type: DataTypes.ENUM('in-sync', 'out-of-sync', 'needs-review'),
        defaultValue: 'in-sync',
      },
      lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      retryCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
      tableName: 'listing_publish_logs',
      timestamps: true,
      indexes: [
        { fields: ['listingId'] },
        { fields: ['platform'] },
        { fields: ['status'] },
        { fields: ['externalId'] },
        { fields: ['publishedAt'] },
      ],
    }
  );

  ListingPublishLog.associate = (models) => {
    ListingPublishLog.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
    });
  };

  return ListingPublishLog;
};
