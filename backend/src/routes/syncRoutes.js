/**
 * Sync Routes
 * Endpoints für Daten-Synchronisierung
 */
const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');
const syncController = require('../controllers/syncController');

const router = express.Router();

// Sync Status (Public - zeigt Konfigurationsstatus)
router.get('/status', syncController.getSyncStatus);

// Trigger ASIN-Sync (Admin-only)
router.post('/asin-traffic', authenticateUser, isAdmin, syncController.triggerAsinSync);

module.exports = router;
