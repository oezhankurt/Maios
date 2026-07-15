'use strict';

/** Adds listing-content fields to products for keyword-gap / listing-score. */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'bullets', { type: Sequelize.JSONB, defaultValue: [] });
    await queryInterface.addColumn('products', 'description', { type: Sequelize.TEXT });
    await queryInterface.addColumn('products', 'backend_keywords', { type: Sequelize.TEXT });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('products', 'bullets');
    await queryInterface.removeColumn('products', 'description');
    await queryInterface.removeColumn('products', 'backend_keywords');
  },
};
