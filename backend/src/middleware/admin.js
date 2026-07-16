const ApiError = require('../utils/ApiError');

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized('Authentication required');
  }

  if (!req.user.isAdmin) {
    throw ApiError.forbidden('Admin access required');
  }

  next();
};

module.exports = { requireAdmin };
