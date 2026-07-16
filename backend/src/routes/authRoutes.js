const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authSchemas, validate: validateSchema } = require('../utils/schemas');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
  skipSuccessfulRequests: true,
});

router.post('/register', authLimiter, validateSchema(authSchemas.register), authController.register);

router.post('/login', authLimiter, validateSchema(authSchemas.login), authController.login);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.get('/login-history', authenticate, authController.getLoginHistory);
router.get('/audit-log', authenticate, authController.getAuditLog);

router.post('/amazon-connect', authenticate, validateSchema(authSchemas.amazonConnect), authController.amazonConnect);

router.post(
  '/send-verification-email',
  authLimiter,
  validateSchema(authSchemas.sendVerificationEmail),
  authController.sendVerificationEmail
);

router.post('/verify-email', authLimiter, validateSchema(authSchemas.verifyEmail), authController.verifyEmail);

router.post(
  '/send-password-reset',
  authLimiter,
  validateSchema(authSchemas.sendPasswordReset),
  authController.sendPasswordResetEmail
);

router.post(
  '/reset-password',
  authLimiter,
  validateSchema(authSchemas.resetPassword),
  authController.resetPassword
);

module.exports = router;
