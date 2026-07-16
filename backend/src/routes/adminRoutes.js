const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin status
router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', adminController.getUsers);

router.put('/users/:userId/status', adminController.updateUserStatus);

router.put('/users/:userId/admin', adminController.toggleAdminStatus);

router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
