const express = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const twoFactorController = require('../controllers/twoFactorController');

const router = express.Router();

// All 2FA routes require authentication
router.use(authenticate);

router.get('/status', twoFactorController.getTwoFactorStatus);

router.post('/initiate', twoFactorController.initiateTwoFactor);

router.post(
  '/enable',
  [
    body('secret').notEmpty().withMessage('Secret erforderlich'),
    body('token').notEmpty().withMessage('Token erforderlich'),
  ],
  validate,
  twoFactorController.enableTwoFactor
);

router.post(
  '/disable',
  [body('password').notEmpty().withMessage('Passwort erforderlich')],
  validate,
  twoFactorController.disableTwoFactor
);

router.post(
  '/verify',
  [
    body('token').optional(),
    body('backupCode').optional(),
  ],
  validate,
  twoFactorController.verifyTwoFactor
);

router.post(
  '/regenerate-backup-codes',
  [body('password').notEmpty().withMessage('Passwort erforderlich')],
  validate,
  twoFactorController.regenerateBackupCodes
);

module.exports = router;
