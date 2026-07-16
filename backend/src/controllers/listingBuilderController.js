const listingBuilderService = require('../services/listingBuilderService');

async function getListings(req, res) {
  try {
    const { status, marketplace } = req.query;
    const listings = await listingBuilderService.getListings({ status, marketplace });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await listingBuilderService.getListing(id);
    if (!listing) return res.status(404).json({ error: 'Nicht gefunden' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createListing(req, res) {
  try {
    const listing = await listingBuilderService.createListing(req.body);
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function updateListing(req, res) {
  try {
    const { id } = req.params;
    const listing = await listingBuilderService.updateListing(id, req.body);
    res.json(listing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function deleteListing(req, res) {
  try {
    const { id } = req.params;
    const result = await listingBuilderService.deleteListing(id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getMetadata(req, res) {
  try {
    const metadata = await listingBuilderService.getMetadata();
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  getMetadata,
};
