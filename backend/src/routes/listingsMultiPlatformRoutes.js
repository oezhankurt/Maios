const express = require('express');
const { authenticate } = require('../middleware/auth');
const listingsController = require('../controllers/listingsController');

const router = express.Router();

// Alle Multi-Platform-Listing-Routes erfordern Authentifizierung
router.use(authenticate);

// Plattformen anzeigen
router.get('/platforms', listingsController.getPlatforms);

// Konfiguration für eine spezifische Plattform anzeigen
router.get('/platforms/:platform', listingsController.getPlatformConfig);

// Listing für eine Plattform transformieren
router.post('/transform', listingsController.transformListing);

// Listing für mehrere Plattformen transformieren
router.post('/transform/multi', listingsController.transformListing);

// Listing für eine Plattform validieren
router.post('/validate', listingsController.validateListing);

// Listing für mehrere Plattformen validieren
router.post('/validate/multi', listingsController.validateMultiPlatformListing);

// Listing-Vorschau für eine Plattform
router.post('/preview', listingsController.previewListing);

// Listing-Vorschau für mehrere Plattformen
router.post('/preview/multi', listingsController.previewMultiPlatformListing);

module.exports = router;
