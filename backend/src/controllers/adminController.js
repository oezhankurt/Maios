const { User, Product, DailySales, AuditLog } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { status: 'active' } });
  const totalProducts = await Product.count();
  const totalSalesRecords = await DailySales.count();

  const recentAuditLogs = await AuditLog.findAll({
    order: [['createdAt', 'DESC']],
    limit: 10,
    include: [{ model: User, as: 'user', attributes: ['email', 'username'] }],
  });

  const usersByDay = await User.sequelize.query(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM users
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        totalProducts,
        totalSalesRecords,
      },
      recentAuditLogs,
      usersByDay: usersByDay[0],
    },
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  const search = req.query.search || '';

  const where = {};
  if (search) {
    where[User.sequelize.Op.or] = [
      { email: { [User.sequelize.Op.iLike]: `%${search}%` } },
      { username: { [User.sequelize.Op.iLike]: `%${search}%` } },
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: ['id', 'email', 'username', 'status', 'isAdmin', 'emailVerified', 'createdAt'],
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  });

  res.json({
    success: true,
    data: { users: rows, total: count, limit, offset },
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    throw ApiError.badRequest('Invalid status');
  }

  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  await user.update({ status });

  await require('../services/auditService').log('ADMIN_USER_STATUS_CHANGED', {
    userId: req.user.id,
    resourceType: 'User',
    resourceId: userId,
    changes: { status },
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'User status updated', data: user });
});

const toggleAdminStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findByPk(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.id === req.user.id) {
    throw ApiError.badRequest('Cannot change own admin status');
  }

  const newAdminStatus = !user.isAdmin;
  await user.update({ isAdmin: newAdminStatus });

  await require('../services/auditService').log('ADMIN_STATUS_TOGGLED', {
    userId: req.user.id,
    resourceType: 'User',
    resourceId: userId,
    changes: { isAdmin: newAdminStatus },
    ipAddress: req.ip,
  });

  res.json({
    success: true,
    message: `User ${newAdminStatus ? 'promoted to' : 'removed from'} admin`,
    data: user,
  });
});

const getAuditLogs = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;

  const { count, rows } = await AuditLog.findAndCountAll({
    order: [['createdAt', 'DESC']],
    limit,
    offset,
    include: [{ model: User, as: 'user', attributes: ['email', 'username'] }],
  });

  res.json({
    success: true,
    data: { auditLogs: rows, total: count, limit, offset },
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  toggleAdminStatus,
  getAuditLogs,
};
