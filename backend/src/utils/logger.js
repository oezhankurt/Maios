const winston = require('winston');

const level = process.env.LOG_LEVEL || 'info';

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level: lvl, message, stack }) => {
      return `${timestamp} [${lvl.toUpperCase()}] ${stack || message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
