const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const { User } = require('../models');

/**
 * Validates the Bearer JWT and attaches the authenticated user to req.user.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw ApiError.unauthorized('Authentication token missing');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const user = await User.findByPk(payload.sub);
    if (!user || user.status !== 'active') {
      throw ApiError.unauthorized('User no longer active');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authenticate };
