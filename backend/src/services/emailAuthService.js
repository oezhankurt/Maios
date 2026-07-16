const { User, EmailVerification, PasswordReset } = require('../models');
const emailService = require('../utils/emailService');
const ApiError = require('../utils/ApiError');

const emailAuthService = {
  async sendVerificationEmail(userId, email) {
    const user = await User.findByPk(userId);
    const token = emailService.generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await EmailVerification.create({
      userId,
      email,
      token,
      expiresAt,
    });

    await emailService.sendVerificationEmail(email, token, user?.username);
    return { success: true, message: 'Verifikations-E-Mail gesendet' };
  },

  async verifyEmail(token) {
    const verification = await EmailVerification.findOne({
      where: { token },
    });

    if (!verification) {
      throw ApiError.badRequest('Ungültiger oder abgelaufener Token');
    }

    if (new Date() > verification.expiresAt) {
      throw ApiError.badRequest('Verifikations-Token ist abgelaufen');
    }

    if (verification.verifiedAt) {
      throw ApiError.badRequest('E-Mail wurde bereits verifiziert');
    }

    await User.update(
      { emailVerified: true },
      { where: { id: verification.userId } }
    );

    await verification.update({ verifiedAt: new Date() });

    return { success: true, message: 'E-Mail erfolgreich verifiziert' };
  },

  async sendPasswordResetEmail(email) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw ApiError.notFound('Benutzer nicht gefunden');
    }

    const token = emailService.generateResetToken();
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1h

    await PasswordReset.create({
      userId: user.id,
      token,
      expiresAt,
    });

    await emailService.sendPasswordResetEmail(email, token, user.username);
    return { success: true, message: 'Passwort-Reset-Link gesendet' };
  },

  async resetPassword(token, newPassword) {
    const reset = await PasswordReset.findOne({
      where: { token },
    });

    if (!reset) {
      throw ApiError.badRequest('Ungültiger oder abgelaufener Token');
    }

    if (new Date() > reset.expiresAt) {
      throw ApiError.badRequest('Reset-Token ist abgelaufen');
    }

    if (reset.usedAt) {
      throw ApiError.badRequest('Dieser Token wurde bereits verwendet');
    }

    const passwordHash = await User.hashPassword(newPassword);
    await User.update(
      { passwordHash },
      { where: { id: reset.userId } }
    );

    await reset.update({ usedAt: new Date() });

    return { success: true, message: 'Passwort erfolgreich zurückgesetzt' };
  },
};

module.exports = emailAuthService;
