const morgan = require('morgan');
const logger = require('../utils/logger');

// Pipe morgan HTTP access logs through winston so everything shares one format.
const stream = {
  write: (message) => logger.http ? logger.http(message.trim()) : logger.info(message.trim()),
};

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream }
);

module.exports = requestLogger;
