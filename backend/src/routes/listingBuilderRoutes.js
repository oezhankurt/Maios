const express = require('express');
const controller = require('../controllers/listingBuilderController');

const router = express.Router();

router.get('/meta', controller.getMetadata);
router.get('/', controller.getListings);
router.get('/:id', controller.getListing);
router.post('/', controller.createListing);
router.put('/:id', controller.updateListing);
router.delete('/:id', controller.deleteListing);

module.exports = router;
