const crypto = require('crypto');

class EmailService {
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // In production, use nodemailer or SendGrid
  async sendVerificationEmail(email, token) {
    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    console.log(`[EMAIL] Verification link for ${email}: ${verifyUrl}`);
    return true;
  }

  async sendPasswordResetEmail(email, token) {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    console.log(`[EMAIL] Reset link for ${email}: ${resetUrl}`);
    return true;
  }

  async sendSecurityAlertEmail(email, action, ipAddress) {
    console.log(`[EMAIL] Security alert for ${email}: ${action} from ${ipAddress}`);
    return true;
  }
}

module.exports = new EmailService();
