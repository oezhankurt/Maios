const express = require('express');
const AmazonListingService = require('../services/amazonListingService');
const { authenticate } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Create listing
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const listing = await AmazonListingService.createListing(req.user.id, req.body);
  res.status(201).json({ success: true, data: listing });
}));

// Get all listings
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { status, productId } = req.query;
  const listings = await AmazonListingService.listListings(req.user.id, { status, productId });
  res.json({ success: true, data: listings });
}));

// Search listings
router.get('/search/:query', authenticate, asyncHandler(async (req, res) => {
  const listings = await AmazonListingService.searchListings(req.user.id, req.params.query);
  res.json({ success: true, data: listings });
}));

// Get specific listing
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const listing = await AmazonListingService.getListing(req.params.id, req.user.id);
  res.json({ success: true, data: listing });
}));

// Update listing
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const listing = await AmazonListingService.updateListing(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: listing });
}));

// Delete listing
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await AmazonListingService.deleteListing(req.params.id, req.user.id);
  res.json({ success: true });
}));

// Publish listing
router.post('/:id/publish', authenticate, asyncHandler(async (req, res) => {
  const result = await AmazonListingService.publishListing(req.params.id, req.user.id);
  res.json({ success: true, data: result });
}));

// Get listing preview
router.get('/:id/preview', authenticate, asyncHandler(async (req, res) => {
  const preview = await AmazonListingService.getListingPreview(req.params.id, req.user.id);
  res.json({ success: true, data: preview });
}));

// Duplicate listing
router.post('/:id/duplicate', authenticate, asyncHandler(async (req, res) => {
  const newListing = await AmazonListingService.duplicateListing(req.params.id, req.user.id);
  res.status(201).json({ success: true, data: newListing });
}));

// Validate listing
router.post('/:id/validate', authenticate, asyncHandler(async (req, res) => {
  const listing = await AmazonListingService.getListing(req.params.id, req.user.id);
  const validation = await AmazonListingService.validateListing(listing);
  res.json({ success: true, data: validation });
}));

module.exports = router;
