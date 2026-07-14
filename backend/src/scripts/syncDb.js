/**
 * Force-syncs the Sequelize models to the database. Useful for local bootstrap.
 * WARNING: with { force: true } this DROPS existing tables.
 */
require('dotenv').config();
const { sequelize } = require('../models');
const logger = require('../utils/logger');

const force = process.argv.includes('--force');

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force, alter: !force });
    logger.info(`Database synced (force=${force}).`);
    process.exit(0);
  } catch (err) {
    logger.error(`Sync failed: ${err.message}`);
    process.exit(1);
  }
})();
