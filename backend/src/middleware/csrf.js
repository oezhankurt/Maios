const { generateCSRFToken, validateCSRFToken, CSRF_TOKEN_HEADER } = require('../utils/csrf');
const ApiError = require('../utils/ApiError');

const CSRF_COOKIE_NAME = 'x-csrf-token';

const csrfGenerate = (req, res, next) => {
  const token = generateCSRFToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 3600000,
  });
  res.csrfToken = token;
  next();
};

const csrfValidate = (req, res, next) => {
  const headerToken = req.get(CSRF_TOKEN_HEADER);
  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

  if (!headerToken || !cookieToken) {
    return next(ApiError.badRequest('CSRF token missing'));
  }

  try {
    const isValid = validateCSRFToken(headerToken, cookieToken);
    if (!isValid) {
      return next(ApiError.badRequest('CSRF token invalid'));
    }
    next();
  } catch (err) {
    next(ApiError.badRequest('CSRF token validation failed'));
  }
};

module.exports = { csrfGenerate, csrfValidate, CSRF_COOKIE_NAME };
