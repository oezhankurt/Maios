const aiOptimizationService = require('../services/aiOptimizationService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

const optimizeForPlatform = asyncHandler(async (req, res) => {
  const { listingData, platform } = req.body;

  if (!platform) {
    throw ApiError.badRequest('Plattform ist erforderlich');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const optimized = await aiOptimizationService.optimizeListingForPlatform(
      listingData,
      platform
    );

    res.json({
      success: true,
      data: {
        platform,
        optimized,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const optimizeMultiplePlatforms = asyncHandler(async (req, res) => {
  const { listingData, platforms } = req.body;

  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    throw ApiError.badRequest('mindestens eine Plattform muss ausgewählt werden');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const results = {};
    const errors = {};

    for (const platform of platforms) {
      try {
        results[platform] = await aiOptimizationService.optimizeListingForPlatform(
          listingData,
          platform
        );
      } catch (error) {
        errors[platform] = error.message;
      }
    }

    res.json({
      success: true,
      data: {
        optimized: results,
        errors,
        successCount: Object.keys(results).length,
        failureCount: Object.keys(errors).length,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const generateKeywords = asyncHandler(async (req, res) => {
  const { productName, description } = req.body;

  if (!productName) {
    throw ApiError.badRequest('Produktname ist erforderlich');
  }

  try {
    const keywords = aiOptimizationService.generateKeywordSuggestions(
      productName,
      description
    );

    res.json({
      success: true,
      data: {
        keywords,
        count: keywords.length,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const generateOptimizedTitle = asyncHandler(async (req, res) => {
  const { productName, keywords, maxLength } = req.body;

  if (!productName) {
    throw ApiError.badRequest('Produktname ist erforderlich');
  }

  try {
    const title = await aiOptimizationService.generateOptimizedTitle(
      productName,
      keywords,
      maxLength || 125
    );

    res.json({
      success: true,
      data: {
        title,
        length: title.length,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const generateOptimizedDescription = asyncHandler(async (req, res) => {
  const { productName, keywords, originalDescription } = req.body;

  if (!productName) {
    throw ApiError.badRequest('Produktname ist erforderlich');
  }

  try {
    const description = await aiOptimizationService.generateOptimizedDescription(
      productName,
      keywords,
      originalDescription
    );

    res.json({
      success: true,
      data: {
        description,
        length: description.length,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const getOptimizationScore = asyncHandler(async (req, res) => {
  const { listingData, platform } = req.body;

  if (!platform) {
    throw ApiError.badRequest('Plattform ist erforderlich');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const score = aiOptimizationService.calculateOptimizationScore(
      listingData,
      platform
    );

    res.json({
      success: true,
      data: {
        platform,
        score,
        maxScore: 100,
        percentage: `${score}%`,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const getOptimizationRecommendations = asyncHandler(async (req, res) => {
  const { listingData, platform } = req.body;

  if (!platform) {
    throw ApiError.badRequest('Plattform ist erforderlich');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const recommendations = aiOptimizationService.getOptimizationRecommendations(
      listingData,
      platform
    );

    res.json({
      success: true,
      data: {
        platform,
        recommendations,
        totalIssues: recommendations.length,
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

const getDetailedReport = asyncHandler(async (req, res) => {
  const { listingData, platform } = req.body;

  if (!platform) {
    throw ApiError.badRequest('Plattform ist erforderlich');
  }

  if (!listingData) {
    throw ApiError.badRequest('Listing-Daten sind erforderlich');
  }

  try {
    const score = aiOptimizationService.calculateOptimizationScore(
      listingData,
      platform
    );

    const recommendations = aiOptimizationService.getOptimizationRecommendations(
      listingData,
      platform
    );

    res.json({
      success: true,
      data: {
        platform,
        score,
        percentage: `${score}%`,
        recommendations,
        issueCount: recommendations.length,
        quality: score >= 80 ? '🟢 Ausgezeichnet' : score >= 60 ? '🟡 Gut' : '🔴 Verbesserung nötig',
      },
    });
  } catch (error) {
    throw ApiError.badRequest(error.message);
  }
});

module.exports = {
  optimizeForPlatform,
  optimizeMultiplePlatforms,
  generateKeywords,
  generateOptimizedTitle,
  generateOptimizedDescription,
  getOptimizationScore,
  getOptimizationRecommendations,
  getDetailedReport,
};
