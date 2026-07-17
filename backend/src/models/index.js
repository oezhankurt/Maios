const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const LoginHistory = require('./LoginHistory')(sequelize);
const EmailVerification = require('./EmailVerification')(sequelize);
const PasswordReset = require('./PasswordReset')(sequelize);
const AuditLog = require('./AuditLog')(sequelize);
const TwoFactorAuth = require('./TwoFactorAuth')(sequelize);
const Product = require('./Product')(sequelize);
const Keyword = require('./Keyword')(sequelize);
const KeywordRanking = require('./KeywordRanking')(sequelize);
const DailySales = require('./DailySales')(sequelize);
const DailyProfit = require('./DailyProfit')(sequelize);
const Competitor = require('./Competitor')(sequelize);
const CompetitorPriceHistory = require('./CompetitorPriceHistory')(sequelize);
const PPCCampaign = require('./PPCCampaign')(sequelize);
const PPCPerformance = require('./PPCPerformance')(sequelize);
const SmartPortfolio = require('./SmartPortfolio')(sequelize);
const AutomationRule = require('./AutomationRule')(sequelize);
const ChangeEvent = require('./ChangeEvent')(sequelize);
const Alert = require('./Alert')(sequelize);
const Listing = require('./Listing')(sequelize);
const ListingVersion = require('./ListingVersion')(sequelize);
const ListingPublishLog = require('./ListingPublishLog')(sequelize);
const ListingTemplate = require('./ListingTemplate')(sequelize);
const RepricingRule = require('./RepricingRule')(sequelize);
const PriceHistory = require('./PriceHistory')(sequelize);

// ── Associations ─────────────────────────────────────────────────────
User.hasMany(LoginHistory, { foreignKey: 'userId', as: 'loginHistory', onDelete: 'CASCADE' });
LoginHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(EmailVerification, { foreignKey: 'userId', as: 'emailVerifications', onDelete: 'CASCADE' });
EmailVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(PasswordReset, { foreignKey: 'userId', as: 'passwordResets', onDelete: 'CASCADE' });
PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(AuditLog, { foreignKey: 'userId', as: 'auditLogs', onDelete: 'CASCADE' });
AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(TwoFactorAuth, { foreignKey: 'userId', as: 'twoFactorAuth', onDelete: 'CASCADE' });
TwoFactorAuth.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Product, { foreignKey: 'userId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Alert, { foreignKey: 'userId', as: 'alerts', onDelete: 'CASCADE' });
Alert.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(Alert, { foreignKey: 'productId', as: 'alerts', onDelete: 'CASCADE' });
Alert.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(ChangeEvent, { foreignKey: 'productId', as: 'changes', onDelete: 'CASCADE' });
ChangeEvent.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

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

// Smart Portfolios & Campaign-Mover automation rules.
User.hasMany(SmartPortfolio, { foreignKey: 'userId', as: 'smartPortfolios', onDelete: 'CASCADE' });
SmartPortfolio.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SmartPortfolio.hasMany(PPCCampaign, { foreignKey: 'smartPortfolioId', as: 'campaigns' });
PPCCampaign.belongsTo(SmartPortfolio, { foreignKey: 'smartPortfolioId', as: 'smartPortfolio' });

User.hasMany(AutomationRule, { foreignKey: 'userId', as: 'automationRules', onDelete: 'CASCADE' });
AutomationRule.belongsTo(User, { foreignKey: 'userId', as: 'user' });
SmartPortfolio.hasMany(AutomationRule, { foreignKey: 'targetPortfolioId', as: 'rules', onDelete: 'CASCADE' });
AutomationRule.belongsTo(SmartPortfolio, { foreignKey: 'targetPortfolioId', as: 'targetPortfolio' });

// Listings
User.hasMany(Listing, { foreignKey: 'userId', as: 'listings', onDelete: 'CASCADE' });
Listing.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(ListingTemplate, { foreignKey: 'userId', as: 'listingTemplates', onDelete: 'CASCADE' });
ListingTemplate.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Listing.hasMany(ListingVersion, { foreignKey: 'listingId', as: 'versions', onDelete: 'CASCADE' });
ListingVersion.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

Listing.hasMany(ListingPublishLog, { foreignKey: 'listingId', as: 'publishLogs', onDelete: 'CASCADE' });
ListingPublishLog.belongsTo(Listing, { foreignKey: 'listingId', as: 'listing' });

// Repricing
User.hasMany(RepricingRule, { foreignKey: 'userId', as: 'repricingRules', onDelete: 'CASCADE' });
RepricingRule.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Product.hasMany(RepricingRule, { foreignKey: 'productId', as: 'repricingRules', onDelete: 'CASCADE' });
RepricingRule.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(PriceHistory, { foreignKey: 'productId', as: 'priceHistory', onDelete: 'CASCADE' });
PriceHistory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
RepricingRule.hasMany(PriceHistory, { foreignKey: 'repricingRuleId', as: 'priceHistory' });
PriceHistory.belongsTo(RepricingRule, { foreignKey: 'repricingRuleId', as: 'repricingRule' });

const db = {
  sequelize,
  User,
  LoginHistory,
  EmailVerification,
  PasswordReset,
  AuditLog,
  TwoFactorAuth,
  Product,
  Keyword,
  KeywordRanking,
  DailySales,
  DailyProfit,
  Competitor,
  CompetitorPriceHistory,
  PPCCampaign,
  PPCPerformance,
  SmartPortfolio,
  AutomationRule,
  ChangeEvent,
  Alert,
  Listing,
  ListingVersion,
  ListingPublishLog,
  ListingTemplate,
  RepricingRule,
  PriceHistory,
};

module.exports = db;
