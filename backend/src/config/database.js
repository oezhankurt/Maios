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

let sequelize;

if (config.db.url) {
  sequelize = new Sequelize(config.db.url, {
    ...commonOptions,
    dialectOptions:
      config.env === 'production'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {},
  });
} else {
  sequelize = new Sequelize(config.db.name, config.db.user, config.db.password, {
    ...commonOptions,
    host: config.db.host,
    port: config.db.port,
  });
}

async function connectDatabase() {
  await sequelize.authenticate();
  logger.info('Database connection established successfully.');
  return sequelize;
}

module.exports = { sequelize, connectDatabase };
