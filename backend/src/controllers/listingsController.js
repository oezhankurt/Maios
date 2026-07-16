const platformManager = require('../adapters/PlatformManager');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const getPlatforms = asyncHandler(async (req, res) => {
  const platforms = platformManager.getAvailablePlatforms();
  const configs = platformManager.getAllPlatformConfigs();

  res.json({
    success: true,
    data: {
      availablePlatforms: platforms,
      platformConfigs: configs,
    },
  });
});

const getPlatformConfig = asyncHandler(async (req, res) => {
  const { platform } = req.params;

  try {
    const config = platformManager.getPlatformConfig(platform);
    const requirements = platformManager.getPlatformRequirements(platform);

    res.json({
      success: true,
      data: {
        config,
        requirements,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const transformListing = asyncHandler(async (req, res) => {
  const { platforms, listingData } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    throw ApiError.badRequest('mindestens eine Plattform muss ausgewählt werden');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const result = platformManager.transformForMultiplePlatforms(platforms, listingData);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const validateListing = asyncHandler(async (req, res) => {
  const { platform, listingData } = req.body;

  if (!platform) {
    throw ApiError.badRequest('Plattform ist erforderlich');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const validation = platformManager.validateForPlatform(platform, listingData);

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const validateMultiPlatformListing = asyncHandler(async (req, res) => {
  const { platforms, listingData } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    throw ApiError.badRequest('mindestens eine Plattform muss ausgewählt werden');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const validations = platformManager.validateForMultiplePlatforms(platforms, listingData);

    const allValid = Object.values(validations).every((v) => v.isValid);
    const allErrors = Object.entries(validations).reduce((acc, [platform, validation]) => {
      if (!validation.isValid) {
        acc[platform] = validation.errors;
      }
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        allValid,
        validations,
        errors: allErrors,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const previewListing = asyncHandler(async (req, res) => {
  const { platform, listingData } = req.body;

  if (!platform) {
    throw ApiError.badRequest('Plattform ist erforderlich');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const transformed = platformManager.transformForPlatform(platform, listingData);
    const validation = platformManager.validateForPlatform(platform, transformed);

    res.json({
      success: true,
      data: {
        platform,
        listing: transformed,
        isValid: validation.isValid,
        errors: validation.errors,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const previewMultiPlatformListing = asyncHandler(async (req, res) => {
  const { platforms, listingData } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    throw ApiError.badRequest('mindestens eine Plattform muss ausgewählt werden');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const result = platformManager.transformForMultiplePlatforms(platforms, listingData);
    const validations = platformManager.validateForMultiplePlatforms(
      platforms,
      result.data
    );

    const previews = {};
    for (const platform of platforms) {
      previews[platform] = {
        listing: result.data[platform],
        isValid: validations[platform].isValid,
        errors: validations[platform].errors,
      };
    }

    res.json({
      success: true,
      data: {
        previews,
        successCount: Object.keys(result.success).length,
        failureCount: Object.keys(result.failed).length,
        globalErrors: result.errors,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

module.exports = {
  getPlatforms,
  getPlatformConfig,
  transformListing,
  validateListing,
  validateMultiPlatformListing,
  previewListing,
  previewMultiPlatformListing,
};
