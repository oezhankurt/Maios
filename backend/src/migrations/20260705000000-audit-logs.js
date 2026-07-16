'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        index: true,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        index: true,
      },
      resource_type: {
        type: Sequelize.STRING,
      },
      resource_id: {
        type: Sequelize.STRING,
      },
      changes: {
        type: Sequelize.JSON,
      },
      ip_address: {
        type: Sequelize.STRING,
      },
      user_agent: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM('success', 'failure'),
        defaultValue: 'success',
      },
      details: {
        type: Sequelize.JSON,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex('audit_logs', ['user_id', 'created_at'], {
      name: 'audit_logs_user_id_created_at_idx',
    });
    await queryInterface.addIndex('audit_logs', ['action', 'created_at'], {
      name: 'audit_logs_action_created_at_idx',
    });
    await queryInterface.addIndex('audit_logs', ['created_at'], {
      name: 'audit_logs_created_at_idx',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('audit_logs');
  },
};
