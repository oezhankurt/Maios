/**
 * Sync Routes
 * Endpoints für Daten-Synchronisierung
 */
const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const { triggerAsinSync, getSyncStatus } = require('../controllers/syncController');

const router = express.Router();

// Sync Status (Public - zeigt Konfigurationsstatus)
router.get('/status', getSyncStatus);

// Trigger ASIN-Sync (Admin-only)
router.post('/asin-traffic', authenticateUser, isAdmin, triggerAsinSync);

module.exports = router;
