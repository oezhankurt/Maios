const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { connectDatabase, sequelize } = require('./config/database');
const scheduler = require('./workers/scheduler');

async function start() {
  try {
    await connectDatabase();

    // In development, keep the schema in sync automatically. In production,
    // rely on migrations (npm run db:migrate).
    if (config.env === 'development') {
      await sequelize.sync();
      logger.info('Database schema synced (development).');
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
