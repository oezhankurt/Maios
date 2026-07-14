'use strict';

/**
 * Initial schema for Maios. Creates all tables with UUID primary keys,
 * foreign keys, and the indexes declared on the Sequelize models.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { UUID, UUIDV4, STRING, TEXT, INTEGER, DECIMAL, DATEONLY, DATE, ENUM, JSONB } = Sequelize;
    const uuidPk = { type: UUID, defaultValue: UUIDV4, primaryKey: true };
    const timestamps = {
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    };
    const fk = (table) => ({
      type: UUID,
      allowNull: false,
      references: { model: table, key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.createTable('users', {
      id: uuidPk,
      email: { type: STRING, allowNull: false, unique: true },
      password_hash: { type: STRING, allowNull: false },
      username: { type: STRING, allowNull: false },
      amazon_seller_id: { type: STRING },
      amazon_access_token: { type: TEXT },
      amazon_refresh_token: { type: TEXT },
      timezone: { type: STRING, defaultValue: 'Europe/Berlin' },
      language: { type: STRING, defaultValue: 'en' },
      currency: { type: STRING, defaultValue: 'EUR' },
      status: { type: ENUM('active', 'inactive'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('users', ['status']);

    await queryInterface.createTable('products', {
      id: uuidPk,
      user_id: fk('users'),
      asin: { type: STRING },
      ean: { type: STRING },
      title: { type: STRING, allowNull: false },
      category: { type: STRING },
      price: { type: DECIMAL(10, 2), defaultValue: 0 },
      cost_per_unit: { type: DECIMAL(10, 2), defaultValue: 0 },
      status: { type: ENUM('active', 'inactive', 'archived'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('products', ['user_id']);
    await queryInterface.addIndex('products', ['asin']);
    await queryInterface.addIndex('products', ['status']);

    await queryInterface.createTable('keywords', {
      id: uuidPk,
      product_id: fk('products'),
      keyword: { type: STRING, allowNull: false },
      keyword_type: {
        type: ENUM('organic', 'sponsored', 'branded', 'competitor'),
        defaultValue: 'organic',
      },
      search_volume: { type: INTEGER, defaultValue: 0 },
      cpc: { type: DECIMAL(10, 2), defaultValue: 0 },
      difficulty_score: { type: INTEGER, defaultValue: 0 },
      status: { type: ENUM('active', 'inactive'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('keywords', ['product_id']);
    await queryInterface.addIndex('keywords', ['keyword']);

    await queryInterface.createTable('keyword_rankings', {
      id: uuidPk,
      product_id: fk('products'),
      keyword_id: fk('keywords'),
      marketplace: {
        type: ENUM('amazon', 'ebay', 'kaufland', 'otto'),
        allowNull: false,
        defaultValue: 'amazon',
      },
      ranking_position: { type: INTEGER },
      previous_ranking: { type: INTEGER },
      rank_date: { type: DATEONLY, allowNull: false },
      ...timestamps,
    });
    await queryInterface.addIndex('keyword_rankings', ['keyword_id']);
    await queryInterface.addIndex('keyword_rankings', ['rank_date']);
    await queryInterface.addIndex('keyword_rankings', ['keyword_id', 'marketplace', 'rank_date'], {
      unique: true,
      name: 'keyword_rankings_unique_day',
    });

    await queryInterface.createTable('daily_sales', {
      id: uuidPk,
      product_id: fk('products'),
      marketplace: {
        type: ENUM('amazon', 'ebay', 'kaufland', 'otto'),
        allowNull: false,
        defaultValue: 'amazon',
      },
      sale_date: { type: DATEONLY, allowNull: false },
      units_sold: { type: INTEGER, defaultValue: 0 },
      price: { type: DECIMAL(10, 2), defaultValue: 0 },
      gross_revenue: { type: DECIMAL(12, 2), defaultValue: 0 },
      referral_fee: { type: DECIMAL(12, 2), defaultValue: 0 },
      fba_fee: { type: DECIMAL(12, 2), defaultValue: 0 },
      ppc_spend: { type: DECIMAL(12, 2), defaultValue: 0 },
      net_revenue: { type: DECIMAL(12, 2), defaultValue: 0 },
      profit: { type: DECIMAL(12, 2), defaultValue: 0 },
      profit_margin: { type: DECIMAL(6, 2), defaultValue: 0 },
      acos: { type: DECIMAL(6, 2), defaultValue: 0 },
      ...timestamps,
    });
    await queryInterface.addIndex('daily_sales', ['sale_date']);
    await queryInterface.addIndex('daily_sales', ['product_id', 'marketplace', 'sale_date'], {
      unique: true,
      name: 'daily_sales_unique_day',
    });

    await queryInterface.createTable('daily_profits', {
      id: uuidPk,
      product_id: fk('products'),
      profit_date: { type: DATEONLY, allowNull: false },
      total_revenue: { type: DECIMAL(12, 2), defaultValue: 0 },
      total_costs: { type: DECIMAL(12, 2), defaultValue: 0 },
      total_profit: { type: DECIMAL(12, 2), defaultValue: 0 },
      profit_margin: { type: DECIMAL(6, 2), defaultValue: 0 },
      avg_acos: { type: DECIMAL(6, 2), defaultValue: 0 },
      units_sold: { type: INTEGER, defaultValue: 0 },
      ...timestamps,
    });
    await queryInterface.addIndex('daily_profits', ['profit_date']);
    await queryInterface.addIndex('daily_profits', ['product_id', 'profit_date'], {
      unique: true,
      name: 'daily_profits_unique_day',
    });

    await queryInterface.createTable('competitors', {
      id: uuidPk,
      product_id: fk('products'),
      marketplace: {
        type: ENUM('amazon', 'ebay', 'kaufland', 'otto'),
        allowNull: false,
        defaultValue: 'amazon',
      },
      competitor_asin: { type: STRING },
      competitor_title: { type: STRING },
      last_checked: { type: DATE },
      status: { type: ENUM('active', 'inactive'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('competitors', ['product_id']);
    await queryInterface.addIndex('competitors', ['competitor_asin']);

    await queryInterface.createTable('competitor_price_history', {
      id: uuidPk,
      competitor_id: fk('competitors'),
      price: { type: DECIMAL(10, 2), allowNull: false },
      price_date: { type: DATEONLY, allowNull: false },
      ...timestamps,
    });
    await queryInterface.addIndex('competitor_price_history', ['competitor_id', 'price_date'], {
      unique: true,
      name: 'competitor_price_unique_day',
    });

    await queryInterface.createTable('ppc_campaigns', {
      id: uuidPk,
      product_id: fk('products'),
      campaign_name: { type: STRING, allowNull: false },
      campaign_type: { type: ENUM('sp', 'sb', 'sd'), defaultValue: 'sp' },
      daily_budget: { type: DECIMAL(10, 2), defaultValue: 0 },
      target_acos: { type: DECIMAL(6, 2), defaultValue: 25 },
      status: { type: ENUM('active', 'paused', 'archived'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('ppc_campaigns', ['product_id']);
    await queryInterface.addIndex('ppc_campaigns', ['status']);

    await queryInterface.createTable('ppc_performance', {
      id: uuidPk,
      campaign_id: fk('ppc_campaigns'),
      performance_date: { type: DATEONLY, allowNull: false },
      impressions: { type: INTEGER, defaultValue: 0 },
      clicks: { type: INTEGER, defaultValue: 0 },
      spend: { type: DECIMAL(12, 2), defaultValue: 0 },
      sales: { type: DECIMAL(12, 2), defaultValue: 0 },
      units_sold: { type: INTEGER, defaultValue: 0 },
      cpc: { type: DECIMAL(10, 2), defaultValue: 0 },
      ctr: { type: DECIMAL(6, 2), defaultValue: 0 },
      acos: { type: DECIMAL(6, 2), defaultValue: 0 },
      roas: { type: DECIMAL(6, 2), defaultValue: 0 },
      ...timestamps,
    });
    await queryInterface.addIndex('ppc_performance', ['performance_date']);
    await queryInterface.addIndex('ppc_performance', ['campaign_id', 'performance_date'], {
      unique: true,
      name: 'ppc_performance_unique_day',
    });

    await queryInterface.createTable('alerts', {
      id: uuidPk,
      user_id: fk('users'),
      product_id: { type: UUID, references: { model: 'products', key: 'id' }, onDelete: 'CASCADE' },
      type: {
        type: ENUM(
          'ranking_drop',
          'acos_high',
          'price_drop',
          'competitor_price',
          'low_stock',
          'recommendation'
        ),
        allowNull: false,
      },
      severity: { type: ENUM('info', 'warning', 'critical'), defaultValue: 'info' },
      title: { type: STRING, allowNull: false },
      message: { type: TEXT },
      meta: { type: JSONB, defaultValue: {} },
      status: { type: ENUM('active', 'read', 'dismissed'), defaultValue: 'active' },
      ...timestamps,
    });
    await queryInterface.addIndex('alerts', ['user_id']);
    await queryInterface.addIndex('alerts', ['status']);
    await queryInterface.addIndex('alerts', ['type']);
  },

  async down(queryInterface) {
    const tables = [
      'alerts',
      'ppc_performance',
      'ppc_campaigns',
      'competitor_price_history',
      'competitors',
      'daily_profits',
      'daily_sales',
      'keyword_rankings',
      'keywords',
      'products',
      'users',
    ];
    for (const t of tables) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.dropTable(t);
    }
    // Drop ENUM types created by Postgres.
    const enums = [
      'enum_users_status', 'enum_products_status', 'enum_keywords_keyword_type',
      'enum_keywords_status', 'enum_keyword_rankings_marketplace',
      'enum_daily_sales_marketplace', 'enum_competitors_marketplace',
      'enum_competitors_status', 'enum_ppc_campaigns_campaign_type',
      'enum_ppc_campaigns_status', 'enum_alerts_type', 'enum_alerts_severity',
      'enum_alerts_status',
    ];
    for (const e of enums) {
      // eslint-disable-next-line no-await-in-loop
      await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${e}";`);
    }
  },
};
