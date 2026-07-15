'use strict';

/** Change-tracking for product listing/price edits (before/after impact). */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { UUID, UUIDV4, STRING, TEXT, DATE } = Sequelize;
    await queryInterface.createTable('change_events', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true },
      user_id: { type: UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      product_id: { type: UUID, allowNull: false, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      field: { type: STRING, allowNull: false },
      old_value: { type: TEXT },
      new_value: { type: TEXT },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
    await queryInterface.addIndex('change_events', ['product_id']);
    await queryInterface.addIndex('change_events', ['created_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('change_events');
  },
};
