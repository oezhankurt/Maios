require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  db: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'maios',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,

  amazon: {
    clientId: process.env.AMAZON_CLIENT_ID || '',
    clientSecret: process.env.AMAZON_CLIENT_SECRET || '',
    refreshToken: process.env.AMAZON_REFRESH_TOKEN || '',
    marketplaceId: process.env.AMAZON_MARKETPLACE_ID || 'A1PA6795UKMFR9',
    region: process.env.AMAZON_REGION || 'eu',
  },

  scheduler: {
    enabled: String(process.env.ENABLE_SCHEDULER || 'true') === 'true',
  },

  logLevel: process.env.LOG_LEVEL || 'info',

  // Marketplaces supported across the platform.
  marketplaces: ['amazon', 'ebay', 'kaufland', 'otto'],
};

module.exports = config;
