'use strict';

/**
 * Multi-channel expansion: convert the fixed marketplace ENUMs to free-form
 * strings (config-driven via config/channels.js) and add an ad-platform
 * dimension to campaigns. Existing values (amazon/ebay/…) stay valid.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const sql = queryInterface.sequelize;
    const toVarchar = async (table) => {
      await sql.query(
        `ALTER TABLE "${table}" ALTER COLUMN "marketplace" TYPE VARCHAR(50) USING "marketplace"::text;`
      );
      await sql.query(`ALTER TABLE "${table}" ALTER COLUMN "marketplace" SET DEFAULT 'amazon';`);
    };
    await toVarchar('daily_sales');
    await toVarchar('keyword_rankings');
    await toVarchar('competitors');

    // Drop the now-unused enum types.
    for (const t of [
      'enum_daily_sales_marketplace',
      'enum_keyword_rankings_marketplace',
      'enum_competitors_marketplace',
    ]) {
      // eslint-disable-next-line no-await-in-loop
      await sql.query(`DROP TYPE IF EXISTS "${t}";`);
    }

    await queryInterface.addColumn('ppc_campaigns', 'ad_platform', {
      type: Sequelize.STRING,
      defaultValue: 'amazon_ads',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('ppc_campaigns', 'ad_platform');
    // Columns stay as VARCHAR on rollback (safe superset of the old enum).
  },
};
