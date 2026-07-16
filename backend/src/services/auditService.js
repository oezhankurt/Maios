const { AuditLog } = require('../models');

const auditService = {
  async log(action, options = {}) {
    try {
      await AuditLog.create({
        userId: options.userId,
        action,
        resourceType: options.resourceType,
        resourceId: options.resourceId,
        changes: options.changes,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        status: options.status || 'success',
        details: options.details,
      });
    } catch (err) {
      console.error(`[AUDIT] Failed to log action: ${action}`, err);
    }
  },

  async getAuditLog(userId, limit = 50, offset = 0) {
    return await AuditLog.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  },

  async getAllAuditLogs(limit = 100, offset = 0, filters = {}) {
    const where = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.status) where.status = filters.status;

    return await AuditLog.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
  },

  // Common audit logging helpers
  async logLogin(userId, ipAddress, userAgent, success = true) {
    await this.log('USER_LOGIN', {
      userId,
      ipAddress,
      userAgent,
      status: success ? 'success' : 'failure',
    });
  },

  async logLogout(userId, ipAddress, userAgent) {
    await this.log('USER_LOGOUT', {
      userId,
      ipAddress,
      userAgent,
    });
  },

  async logRegistration(userId, email, ipAddress, userAgent) {
    await this.log('USER_REGISTER', {
      userId,
      ipAddress,
      userAgent,
      details: { email },
    });
  },

  async logEmailVerification(userId, email) {
    await this.log('EMAIL_VERIFIED', {
      userId,
      resourceType: 'User',
      resourceId: userId,
      details: { email },
    });
  },

  async logPasswordChange(userId, ipAddress, userAgent) {
    await this.log('PASSWORD_RESET', {
      userId,
      ipAddress,
      userAgent,
      resourceType: 'User',
      resourceId: userId,
    });
  },

  async logPasswordReset(email, success = true) {
    await this.log('PASSWORD_RESET_REQUESTED', {
      status: success ? 'success' : 'failure',
      details: { email },
    });
  },

  async logAmazonConnect(userId, sellerId) {
    await this.log('AMAZON_ACCOUNT_CONNECTED', {
      userId,
      resourceType: 'User',
      resourceId: userId,
      details: { sellerId },
    });
  },

  async logDataExport(userId, dataType) {
    await this.log('DATA_EXPORT', {
      userId,
      details: { dataType },
    });
  },

  async logSettingsChange(userId, settingName, oldValue, newValue) {
    await this.log('SETTINGS_UPDATED', {
      userId,
      resourceType: 'User',
      resourceId: userId,
      changes: {
        [settingName]: { before: oldValue, after: newValue },
      },
    });
  },
};

module.exports = auditService;
