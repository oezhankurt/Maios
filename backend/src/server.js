const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDatabase, sequelize } = require('./config/database');
const scheduler = require('./workers/scheduler');

async function start() {
  try {
    await connectDatabase();

    // Sync database schema - creates missing tables
    // In development: full sync with alter
    // In production: sync only if tables don't exist
    try {
      if (config.env === 'development') {
        await sequelize.sync({ alter: true });
        logger.info('Database schema synced (development).');
      } else {
        // In production, only create missing tables, don't alter existing ones
        await sequelize.sync({ alter: false });
        logger.info('Database schema synced (production).');
      }
    } catch (syncErr) {
      logger.warn(`Database sync warning: ${syncErr.message}`);
      // Continue anyway - migrations may have already run or tables may exist
    }

    const server = app.listen(config.port, () => {
      logger.info(`Maios API listening on port ${config.port} (${config.env})`);
    });

    if (config.scheduler.enabled) {
      scheduler.start();
    }

    const shutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);
      scheduler.stop();
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

start();
