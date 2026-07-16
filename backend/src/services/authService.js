const { LoginHistory } = require('../models');

const authService = {
  async logLoginEvent(userId, req) {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    await LoginHistory.create({
      userId,
      event: 'login',
      ipAddress,
      userAgent,
    });
  },

  async logLogoutEvent(userId, req) {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    await LoginHistory.create({
      userId,
      event: 'logout',
      ipAddress,
      userAgent,
    });
  },

  async getLoginHistory(userId, limit = 50, offset = 0) {
    const { count, rows } = await LoginHistory.findAndCountAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
      offset,
    });

    return { count, rows };
  },
};

module.exports = authService;
