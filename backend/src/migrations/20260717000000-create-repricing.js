'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RepricingRules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      strategy: {
        type: Sequelize.ENUM('sales-based', 'time-based', 'competitor-based', 'margin-based'),
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      minPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      maxPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      currentPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      config: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      appliedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastApplied: {
        type: Sequelize.DATE,
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.createTable('PriceHistories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Products',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      marketplace: {
        type: Sequelize.ENUM('amazon', 'ebay', 'otto', 'kaufland'),
        defaultValue: 'amazon',
      },
      source: {
        type: Sequelize.ENUM('manual', 'reprice-rule', 'system'),
        defaultValue: 'system',
      },
      repricingRuleId: {
        type: Sequelize.UUID,
        references: {
          model: 'RepricingRules',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      competitorPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      buyBoxPrice: {
        type: Sequelize.DECIMAL(10, 2),
      },
      metadata: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('PriceHistories');
    await queryInterface.dropTable('RepricingRules');
  },
};
