const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { TwoFactorAuth } = require('../models');

const twoFactorService = {
  async generateSecret(userEmail) {
    const secret = speakeasy.generateSecret({
      name: `Maios (${userEmail})`,
      issuer: 'Maios',
      length: 32,
    });

    return {
      secret: secret.base32,
      qrCode: await QRCode.toDataURL(secret.otpauth_url),
    };
  },

  async generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  },

  async enableTwoFactor(userId, userEmail, secret) {
    const backupCodes = await this.generateBackupCodes();

    const twoFactor = await TwoFactorAuth.create({
      userId,
      secret,
      isEnabled: true,
      backupCodes,
      enabledAt: new Date(),
    });

    return {
      success: true,
      message: '2FA erfolgreich aktiviert',
      backupCodes,
    };
  },

  async disableTwoFactor(userId) {
    await TwoFactorAuth.destroy({ where: { userId } });
    return {
      success: true,
      message: '2FA erfolgreich deaktiviert',
    };
  },

  async verifyToken(userId, token) {
    const twoFactor = await TwoFactorAuth.findOne({
      where: { userId, isEnabled: true },
    });

    if (!twoFactor) {
      return { valid: false, message: '2FA nicht aktiviert' };
    }

    const isValid = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (isValid) {
      await twoFactor.update({ lastUsedAt: new Date() });
      return { valid: true };
    }

    return { valid: false, message: 'Ungültiger 2FA-Code' };
  },

  async verifyBackupCode(userId, code) {
    const twoFactor = await TwoFactorAuth.findOne({
      where: { userId, isEnabled: true },
    });

    if (!twoFactor || !twoFactor.backupCodes.includes(code)) {
      return { valid: false };
    }

    const updatedCodes = twoFactor.backupCodes.filter((c) => c !== code);
    await twoFactor.update({ backupCodes: updatedCodes });

    return { valid: true };
  },

  async getTwoFactorStatus(userId) {
    const twoFactor = await TwoFactorAuth.findOne({
      where: { userId },
    });

    if (!twoFactor) {
      return { enabled: false };
    }

    return {
      enabled: twoFactor.isEnabled,
      enabledAt: twoFactor.enabledAt,
      backupCodesRemaining: twoFactor.backupCodes?.length || 0,
    };
  },
};

module.exports = twoFactorService;
