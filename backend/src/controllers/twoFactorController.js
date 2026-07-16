const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const twoFactorService = require('../services/twoFactorService');
const auditService = require('../services/auditService');

const getTwoFactorStatus = asyncHandler(async (req, res) => {
  const status = await twoFactorService.getTwoFactorStatus(req.user.id);
  res.json({ success: true, data: status });
});

const initiateTwoFactor = asyncHandler(async (req, res) => {
  const { secret, qrCode } = await twoFactorService.generateSecret(req.user.email);

  res.json({
    success: true,
    data: {
      secret,
      qrCode,
      message: 'QR-Code mit Authenticator-App scannen',
    },
  });
});

const enableTwoFactor = asyncHandler(async (req, res) => {
  const { secret, token } = req.body;

  if (!secret || !token) {
    throw ApiError.badRequest('Secret und Token erforderlich');
  }

  const isValid = require('speakeasy').totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });

  if (!isValid) {
    throw ApiError.badRequest('Ungültiger 2FA-Code');
  }

  const result = await twoFactorService.enableTwoFactor(req.user.id, req.user.email, secret);

  await auditService.log('2FA_ENABLED', {
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    message: result.message,
    data: {
      backupCodes: result.backupCodes,
      warning: 'Bitte speichern Sie diese Codes an einem sicheren Ort',
    },
  });
});

const disableTwoFactor = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw ApiError.badRequest('Passwort erforderlich zur Bestätigung');
  }

  const isValid = await req.user.validatePassword(password);
  if (!isValid) {
    throw ApiError.unauthorized('Passwort ungültig');
  }

  const result = await twoFactorService.disableTwoFactor(req.user.id);

  await auditService.log('2FA_DISABLED', {
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({ success: true, message: result.message });
});

const verifyTwoFactor = asyncHandler(async (req, res) => {
  const { token, backupCode } = req.body;

  if (!token && !backupCode) {
    throw ApiError.badRequest('Token oder Backup-Code erforderlich');
  }

  let isValid = false;

  if (token) {
    const result = await twoFactorService.verifyToken(req.user.id, token);
    isValid = result.valid;
  }

  if (backupCode && !isValid) {
    const result = await twoFactorService.verifyBackupCode(req.user.id, backupCode);
    isValid = result.valid;
  }

  if (!isValid) {
    throw ApiError.badRequest('Ungültiger 2FA-Code oder Backup-Code');
  }

  res.json({ success: true, message: '2FA erfolgreich verifiziert' });
});

const regenerateBackupCodes = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw ApiError.badRequest('Passwort erforderlich');
  }

  const isValid = await req.user.validatePassword(password);
  if (!isValid) {
    throw ApiError.unauthorized('Passwort ungültig');
  }

  const { TwoFactorAuth } = require('../models');
  const twoFactor = await TwoFactorAuth.findOne({
    where: { userId: req.user.id, isEnabled: true },
  });

  if (!twoFactor) {
    throw ApiError.badRequest('2FA nicht aktiviert');
  }

  const backupCodes = await twoFactorService.generateBackupCodes();
  await twoFactor.update({ backupCodes });

  await auditService.log('2FA_BACKUP_CODES_REGENERATED', {
    userId: req.user.id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.json({
    success: true,
    data: { backupCodes },
    message: 'Neue Backup-Codes generiert',
  });
});

module.exports = {
  getTwoFactorStatus,
  initiateTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  verifyTwoFactor,
  regenerateBackupCodes,
};
