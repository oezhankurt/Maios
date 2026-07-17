const rateLimit = require('express-rate-limit');

// Memory-based rate limiting for authenticated users
const userLimiters = new Map();

function getOrCreateLimiter(userId) {
  if (!userLimiters.has(userId)) {
    userLimiters.set(
      userId,
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: 'Zu viele Anfragen von diesem Benutzerkonto. Bitte versuchen Sie es später erneut.',
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req, res) => !req.user,
      })
    );
  }
  return userLimiters.get(userId);
}

const rateLimitByUser = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  const limiter = getOrCreateLimiter(req.user.id);
  limiter(req, res, next);
};

module.exports = rateLimitByUser;
