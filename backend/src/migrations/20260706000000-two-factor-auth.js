'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('two_factor_auth', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
        index: true,
      },
      secret: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      backup_codes: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      last_used_at: {
        type: Sequelize.DATE,
      },
      enabled_at: {
        type: Sequelize.DATE,
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('two_factor_auth');
  },
};
