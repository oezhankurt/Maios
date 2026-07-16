const crypto = require('crypto');

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_HEADER = 'x-csrf-token';

const generateCSRFToken = () => {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
};

const validateCSRFToken = (tokenFromHeader, tokenFromCookie) => {
  if (!tokenFromHeader || !tokenFromCookie) return false;
  return crypto.timingSafeEqual(
    Buffer.from(tokenFromHeader),
    Buffer.from(tokenFromCookie)
  );
};

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  CSRF_TOKEN_HEADER,
};
