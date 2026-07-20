/**
 * Sync Controller
 * Endpoints für manuellen Daten-Import
 */
const asyncHandler = require('../utils/asyncHandler');
const asinSyncWorker = require('../workers/asinSyncWorker');
const logger = require('../utils/logger');
const supermetricsService = require('../services/supermetricsService');

// Trigger manuellen ASIN-Sync
const triggerAsinSync = asyncHandler(async (req, res) => {
  const result = await asinSyncWorker.run();

  res.json({
    success: true,
    message: 'ASIN-Sync erfolgreich',
    data: result,
  });
});

// Check ob Supermetrics konfiguriert ist
const getSyncStatus = asyncHandler(async (req, res) => {
  res.json({
    configured: supermetricsService.isConfigured(),
    dsUser: supermetricsService.dsUser || 'nicht konfiguriert',
    marketplace: supermetricsService.marketplace,
    message: supermetricsService.isConfigured()
      ? '✅ Supermetrics konfiguriert - Sync läuft täglich'
      : '❌ Bitte SUPERMETRICS_API_KEY in .env eintragen',
  });
});

module.exports = {
  triggerAsinSync,
  getSyncStatus,
};
