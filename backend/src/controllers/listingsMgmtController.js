const listingService = require('../services/listingService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const createListing = asyncHandler(async (req, res) => {
  const { listingData } = req.body;

  if (!listingData || !listingData.name || !listingData.price) {
    throw ApiError.badRequest('Produktname und Preis sind erforderlich');
  }

  const listing = await listingService.createListing(req.user.id, listingData);

  res.status(201).json({
    success: true,
    message: 'Listing erstellt',
    data: listing,
  });
});

const updateListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { updateData, changeNotes } = req.body;

  if (!updateData) {
    throw ApiError.badRequest('Update-Daten sind erforderlich');
  }

  const listing = await listingService.updateListing(listingId, req.user.id, {
    ...updateData,
    changeNotes,
  });

  res.json({
    success: true,
    message: 'Listing aktualisiert',
    data: listing,
  });
});

const optimizeListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { platforms } = req.body;

  if (!platforms || platforms.length === 0) {
    throw ApiError.badRequest('Mindestens eine Plattform muss ausgewählt werden');
  }

  const result = await listingService.optimizeListing(listingId, req.user.id, platforms);

  res.json({
    success: true,
    message: 'Listing optimiert',
    data: result,
  });
});

const publishListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;
  const { platforms } = req.body;

  if (!platforms || platforms.length === 0) {
    throw ApiError.badRequest('Mindestens eine Plattform muss ausgewählt werden');
  }

  const result = await listingService.publishListing(listingId, req.user.id, platforms);

  res.json({
    success: true,
    message: 'Listing veröffentlicht',
    data: result,
  });
});

const getListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const listing = await listingService.getListing(listingId, req.user.id);

  res.json({
    success: true,
    data: listing,
  });
});

const listListings = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  const status = req.query.status || null;

  const result = await listingService.listUserListings(req.user.id, {
    limit,
    offset,
    status,
  });

  res.json({
    success: true,
    data: result,
  });
});

const deleteListing = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const result = await listingService.deleteListing(listingId, req.user.id);

  res.json({
    success: true,
    message: result.message,
  });
});

const getListingVersions = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  const versions = await listingService.getListingVersions(listingId, req.user.id);

  res.json({
    success: true,
    data: {
      versions,
      count: versions.length,
    },
  });
});

const restoreVersion = asyncHandler(async (req, res) => {
  const { listingId, versionId } = req.params;

  const listing = await listingService.restoreVersion(listingId, req.user.id, versionId);

  res.json({
    success: true,
    message: 'Version wiederhergestellt',
    data: listing,
  });
});

module.exports = {
  createListing,
  updateListing,
  optimizeListing,
  publishListing,
  getListing,
  listListings,
  deleteListing,
  getListingVersions,
  restoreVersion,
};
