const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const Product = require('./Product')(sequelize);
const Keyword = require('./Keyword')(sequelize);
const KeywordRanking = require('./KeywordRanking')(sequelize);
const DailySales = require('./DailySales')(sequelize);
const DailyProfit = require('./DailyProfit')(sequelize);
const Competitor = require('./Competitor')(sequelize);
const CompetitorPriceHistory = require('./CompetitorPriceHistory')(sequelize);
const PPCCampaign = require('./PPCCampaign')(sequelize);
const PPCPerformance = require('./PPCPerformance')(sequelize);
const Alert = require('./Alert')(sequelize);

// ── Associations ─────────────────────────────────────────────────────
User.hasMany(Product, { foreignKey: 'userId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts', onDelete: 'CASCADE' });
Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Alert, { foreignKey: 'productId', as: 'alerts', onDelete: 'CASCADE' });
Alert.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Keyword, { foreignKey: 'productId', as: 'keywords', onDelete: 'CASCADE' });
Keyword.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Keyword.hasMany(KeywordRanking, { foreignKey: 'keywordId', as: 'rankings', onDelete: 'CASCADE' });
KeywordRanking.belongsTo(Keyword, { foreignKey: 'keywordId', as: 'keyword' });
Product.hasMany(KeywordRanking, { foreignKey: 'productId', as: 'rankings', onDelete: 'CASCADE' });
KeywordRanking.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(DailySales, { foreignKey: 'productId', as: 'dailySales', onDelete: 'CASCADE' });
DailySales.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(DailyProfit, { foreignKey: 'productId', as: 'dailyProfits', onDelete: 'CASCADE' });
DailyProfit.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(Competitor, { foreignKey: 'productId', as: 'competitors', onDelete: 'CASCADE' });
Competitor.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Competitor.hasMany(CompetitorPriceHistory, {
  foreignKey: 'competitorId',
  as: 'priceHistory',
  onDelete: 'CASCADE',
});
CompetitorPriceHistory.belongsTo(Competitor, { foreignKey: 'competitorId', as: 'competitor' });

Product.hasMany(PPCCampaign, { foreignKey: 'productId', as: 'campaigns', onDelete: 'CASCADE' });
PPCCampaign.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

PPCCampaign.hasMany(PPCPerformance, {
  foreignKey: 'campaignId',
  as: 'performance',
  onDelete: 'CASCADE',
});
PPCPerformance.belongsTo(PPCCampaign, { foreignKey: 'campaignId', as: 'campaign' });

const db = {
  sequelize,
  User,
  Product,
  Keyword,
  KeywordRanking,
  DailySales,
  DailyProfit,
  Competitor,
  CompetitorPriceHistory,
  PPCCampaign,
  PPCPerformance,
  Alert,
};

module.exports = db;
