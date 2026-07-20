/**
 * Sync Controller
 * Endpoints für manuellen Daten-Import
 */
const asyncHandler = require('../utils/asyncHandler');
const asinSyncWorker = require('../workers/asinSyncWorker');
const logger = require('../utils/logger');

// POST /api/sync/asin-traffic
// Trigger manuellen ASIN-Sync
exports.triggerAsinSync = asyncHandler(async (req, res) => {
  const result = await asinSyncWorker.run();

  res.json({
    success: true,
    message: 'ASIN-Sync erfolgreich',
    data: result,
  });
});

// GET /api/sync/status
// Check ob Supermetrics konfiguriert ist
exports.getSyncStatus = asyncHandler(async (req, res) => {
  const supermetricsService = require('../services/supermetricsService');

  res.json({
    configured: supermetricsService.isConfigured(),
    dsUser: supermetricsService.dsUser || 'nicht konfiguriert',
    marketplace: supermetricsService.marketplace,
    message: supermetricsService.isConfigured()
      ? '✅ Supermetrics konfiguriert - Sync läuft täglich'
      : '❌ Bitte SUPERMETRICS_API_KEY in .env eintragen',
  });
});
