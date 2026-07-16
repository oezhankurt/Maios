const express = require('express');
const { authenticate } = require('../middleware/auth');
const listingsMgmtController = require('../controllers/listingsMgmtController');

const router = express.Router();

router.use(authenticate);

// CRUD Operations
router.post('/', listingsMgmtController.createListing);
router.get('/', listingsMgmtController.listListings);
router.get('/:listingId', listingsMgmtController.getListing);
router.put('/:listingId', listingsMgmtController.updateListing);
router.delete('/:listingId', listingsMgmtController.deleteListing);

// Optimization
router.post('/:listingId/optimize', listingsMgmtController.optimizeListing);

// Publishing
router.post('/:listingId/publish', listingsMgmtController.publishListing);

// Versions
router.get('/:listingId/versions', listingsMgmtController.getListingVersions);
router.post('/:listingId/versions/:versionId/restore', listingsMgmtController.restoreVersion);

module.exports = router;
