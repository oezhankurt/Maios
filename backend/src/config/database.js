const { Sequelize } = require('sequelize');
const config = require('./index');
const logger = require('../utils/logger');

const commonOptions = {
  dialect: 'postgres',
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    freezeTableName: false,
    timestamps: true,
  },
};

// SSL is opt-in via DB_SSL=true. Managed/public Postgres URLs usually require
// it; Railway's internal Postgres does NOT, so leave DB_SSL unset there.
const useSsl = process.env.DB_SSL === 'true';
const sslDialectOptions = useSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {};

let sequelize;

if (config.db.url) {
  sequelize = new Sequelize(config.db.url, {
    ...commonOptions,
    dialectOptions: sslDialectOptions,
  });
} else {
  sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    ...commonOptions,
    host: config.db.host,
    port: config.db.port,
    dialectOptions: sslDialectOptions,
  });
}

async function connectDatabase() {
  await sequelize.authenticate();
  logger.info('Database connection established successfully.');
  return sequelize;
}

module.exports = { sequelize, connectDatabase };
