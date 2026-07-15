'use strict';

/**
 * Smart Portfolios + Campaign-Mover automation rules (Adference-style PPC).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { UUID, UUIDV4, STRING, DECIMAL, BOOLEAN, ENUM, JSONB, DATE } = Sequelize;
    const uuidPk = { type: UUID, defaultValue: UUIDV4, primaryKey: true };
    const timestamps = {
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    };

    await queryInterface.createTable('smart_portfolios', {
      id: uuidPk,
      user_id: {
        type: UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: STRING, allowNull: false },
      target_acos: { type: DECIMAL(6, 2), defaultValue: 15 },
      daily_budget: { type: DECIMAL(10, 2), defaultValue: 0 },
      campaign_types: { type: JSONB, defaultValue: ['sp'] },
      sta_enabled: { type: BOOLEAN, defaultValue: false },
      pbo_enabled: { type: BOOLEAN, defaultValue: false },
      status: { type: ENUM('active', 'paused'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('smart_portfolios', ['user_id']);

    await queryInterface.createTable('automation_rules', {
      id: uuidPk,
      user_id: {
        type: UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      target_portfolio_id: {
        type: UUID,
        allowNull: false,
        references: { model: 'smart_portfolios', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: { type: STRING, allowNull: false },
      active: { type: BOOLEAN, defaultValue: true },
      logic: { type: ENUM('all', 'any'), defaultValue: 'all' },
      conditions: { type: JSONB, defaultValue: [] },
      last_run_at: { type: DATE },
      ...timestamps,
    });
    await queryInterface.addIndex('automation_rules', ['user_id']);
    await queryInterface.addIndex('automation_rules', ['target_portfolio_id']);

    await queryInterface.addColumn('ppc_campaigns', 'smart_portfolio_id', {
      type: UUID,
      references: { model: 'smart_portfolios', key: 'id' },
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ppc_campaigns', 'smart_portfolio_id');
    await queryInterface.dropTable('automation_rules');
    await queryInterface.dropTable('smart_portfolios');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_automation_rules_logic";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_smart_portfolios_status";');
  },
};
