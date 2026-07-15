'use strict';

/**
 * Adds sellerboard-style fields:
 *  - products: sku, image_url, fba_stock, fbm_stock (inventory)
 *  - daily_sales: refunds, refunded_amount (Erstattungen)
 * All additive and nullable/defaulted, so it is safe on an existing database.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { STRING, INTEGER, DECIMAL } = Sequelize;

    await queryInterface.addColumn('products', 'sku', { type: STRING, allowNull: true });
    await queryInterface.addColumn('products', 'image_url', { type: STRING, allowNull: true });
    await queryInterface.addColumn('products', 'fba_stock', { type: INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('products', 'fbm_stock', { type: INTEGER, defaultValue: 0 });

    await queryInterface.addColumn('daily_sales', 'refunds', { type: INTEGER, defaultValue: 0 });
    await queryInterface.addColumn('daily_sales', 'refunded_amount', {
      type: DECIMAL(12, 2),
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'sku');
    await queryInterface.removeColumn('products', 'image_url');
    await queryInterface.removeColumn('products', 'fba_stock');
    await queryInterface.removeColumn('products', 'fbm_stock');
    await queryInterface.removeColumn('daily_sales', 'refunds');
    await queryInterface.removeColumn('daily_sales', 'refunded_amount');
  },
};
