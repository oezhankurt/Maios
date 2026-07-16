'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create listings table
    await queryInterface.createTable('listings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      productName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      basePrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        defaultValue: 'EUR',
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      ean: {
        type: Sequelize.STRING(14),
        allowNull: true,
      },
      asin: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      keywords: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      bulletPoints: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      images: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived', 'scheduled'),
        defaultValue: 'draft',
      },
      publishedPlatforms: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      optimizationScore: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      optimizationReport: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      scheduledPublishDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastModifiedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      lastPublishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes
    await queryInterface.addIndex('listings', ['userId']);
    await queryInterface.addIndex('listings', ['status']);
    await queryInterface.addIndex('listings', ['sku']);
    await queryInterface.addIndex('listings', ['asin']);
    await queryInterface.addIndex('listings', ['createdAt']);

    // Create listing_versions table
    await queryInterface.createTable('listing_versions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      listingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      data: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      changes: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      changeType: {
        type: Sequelize.ENUM('created', 'edited', 'optimized', 'published', 'restored'),
        defaultValue: 'edited',
      },
      changedBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      changeNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('listing_versions', ['listingId']);
    await queryInterface.addIndex('listing_versions', ['versionNumber']);
    await queryInterface.addIndex('listing_versions', ['createdAt']);

    // Create listing_publish_logs table
    await queryInterface.createTable('listing_publish_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      listingId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'listings',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      platform: {
        type: Sequelize.ENUM('amazon', 'ebay', 'kaufland', 'otto'),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('pending', 'publishing', 'published', 'failed', 'unpublished'),
        defaultValue: 'pending',
      },
      externalId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      externalUrl: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      publishedData: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      errorDetails: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      unpublishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      syncStatus: {
        type: Sequelize.ENUM('in-sync', 'out-of-sync', 'needs-review'),
        defaultValue: 'in-sync',
      },
      lastSyncAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      retryCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('listing_publish_logs', ['listingId']);
    await queryInterface.addIndex('listing_publish_logs', ['platform']);
    await queryInterface.addIndex('listing_publish_logs', ['status']);
    await queryInterface.addIndex('listing_publish_logs', ['externalId']);
    await queryInterface.addIndex('listing_publish_logs', ['publishedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('listing_publish_logs');
    await queryInterface.dropTable('listing_versions');
    await queryInterface.dropTable('listings');
  },
};
