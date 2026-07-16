const crypto = require('crypto');
const verificationEmailTemplate = require('../templates/verificationEmail');
const resetPasswordEmailTemplate = require('../templates/resetPasswordEmail');
const securityAlertEmailTemplate = require('../templates/securityAlertEmail');

class EmailService {
  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email, token, username) {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const htmlContent = verificationEmailTemplate({
      email,
      username: username || email.split('@')[0],
      verifyUrl,
      token,
    });

    if (this.isDev) {
      console.log(`[EMAIL] Verification email for ${email}`);
      console.log(`Verify URL: ${verifyUrl}`);
    } else {
      // In production, send via nodemailer/SendGrid
      await this._sendEmail(email, 'Bestätige deine E-Mail-Adresse', htmlContent);
    }
    return true;
  }

  async sendPasswordResetEmail(email, token, username) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const htmlContent = resetPasswordEmailTemplate({
      email,
      username: username || email.split('@')[0],
      resetUrl,
    });

    if (this.isDev) {
      console.log(`[EMAIL] Password reset email for ${email}`);
      console.log(`Reset URL: ${resetUrl}`);
    } else {
      // In production, send via nodemailer/SendGrid
      await this._sendEmail(email, 'Passwort zurücksetzen', htmlContent);
    }
    return true;
  }

  async sendSecurityAlertEmail(email, action, ipAddress, additionalData = {}) {
    const accountUrl = `${process.env.CLIENT_URL}/settings`;
    const htmlContent = securityAlertEmailTemplate({
      email,
      username: additionalData.username || email.split('@')[0],
      action,
      ipAddress,
      timestamp: additionalData.timestamp,
      location: additionalData.location,
      device: additionalData.device,
      accountUrl,
    });

    if (this.isDev) {
      console.log(`[EMAIL] Security alert for ${email}: ${action} from ${ipAddress}`);
    } else {
      // In production, send via nodemailer/SendGrid
      await this._sendEmail(email, '🚨 Sicherheitsmitteilung', htmlContent);
    }
    return true;
  }

  // Placeholder for actual email sending in production
  async _sendEmail(to, subject, htmlContent) {
    // TODO: Implement with nodemailer or SendGrid
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    // await transporter.sendMail({
    //   from: process.env.SMTP_FROM,
    //   to,
    //   subject,
    //   html: htmlContent,
    // });
    console.log(`[EMAIL] Would send to ${to}: ${subject}`);
    return true;
  }
}

module.exports = new EmailService();
