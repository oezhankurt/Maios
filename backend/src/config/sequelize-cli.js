// Configuration consumed by sequelize-cli for migrations/seeders.
require('dotenv').config();

const base = {
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'maios',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: 'postgres',
};

// SSL is opt-in via DB_SSL=true (Railway internal Postgres does not use SSL).
const useSsl = process.env.DB_SSL === 'true';
const sslOptions = useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {};

const fromUrl = process.env.DATABASE_URL
  ? {
      use_env_variable: 'DATABASE_URL',
      dialect: 'postgres',
      dialectOptions: sslOptions,
    }
  : null;

module.exports = {
  development: fromUrl || base,
  test: fromUrl || { ...base, database: `${base.database}_test` },
  production: fromUrl || { ...base, dialectOptions: sslOptions },
};
