const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Zu viele Versuche. Bitte versuchen Sie es später erneut.',
  skipSuccessfulRequests: true,
});

router.post(
  '/register',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('username').notEmpty().withMessage('Username required'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  authController.login
);

router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.get('/login-history', authenticate, authController.getLoginHistory);

router.post(
  '/amazon-connect',
  authenticate,
  [body('refreshToken').notEmpty().withMessage('refreshToken required')],
  validate,
  authController.amazonConnect
);

module.exports = router;
