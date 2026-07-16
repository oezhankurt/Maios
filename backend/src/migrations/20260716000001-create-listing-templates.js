'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('listing_templates', {
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
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      templateData: {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      platforms: {
        type: Sequelize.JSON,
        defaultValue: ['amazon', 'ebay', 'kaufland', 'otto'],
      },
      tags: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      usageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('listing_templates', ['userId']);
    await queryInterface.addIndex('listing_templates', ['category']);
    await queryInterface.addIndex('listing_templates', ['createdAt']);
    await queryInterface.addIndex('listing_templates', ['usageCount']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('listing_templates');
  },
};
