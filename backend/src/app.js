const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { csrfGenerate } = require('./middleware/csrf');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl === '*' ? true : config.clientUrl.split(','),
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(requestLogger);
app.use(csrfGenerate);

// Basic rate limiting on the API surface.
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/', (req, res) => {
  res.json({ name: 'Maios API', version: '1.0.0', docs: '/api/health' });
});

// CSRF validation for state-changing requests (not GET/HEAD/OPTIONS)
const { csrfValidate } = require('./middleware/csrf');
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  csrfValidate(req, res, next);
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
