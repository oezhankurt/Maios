const express = require('express');
const { authenticate } = require('../middleware/auth');
const aiOptimizationController = require('../controllers/aiOptimizationController');

const router = express.Router();

// Alle AI Optimization Routes erfordern Authentifizierung
router.use(authenticate);

// Listing für eine Plattform optimieren
router.post('/optimize', aiOptimizationController.optimizeForPlatform);

// Listing für mehrere Plattformen optimieren
router.post('/optimize/multi', aiOptimizationController.optimizeMultiplePlatforms);

// Keywords generieren
router.post('/keywords', aiOptimizationController.generateKeywords);

// Optimierten Titel generieren
router.post('/generate-title', aiOptimizationController.generateOptimizedTitle);

// Optimierte Beschreibung generieren
router.post('/generate-description', aiOptimizationController.generateOptimizedDescription);

// Optimierungs-Score berechnen
router.post('/score', aiOptimizationController.getOptimizationScore);

// Optimierungs-Empfehlungen abrufen
router.post('/recommendations', aiOptimizationController.getOptimizationRecommendations);

// Detaillierter Optimierungs-Report
router.post('/report', aiOptimizationController.getDetailedReport);

module.exports = router;
