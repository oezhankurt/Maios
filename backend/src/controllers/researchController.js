const asyncHandler = require('../utils/asyncHandler');
const productResearch = require('../services/productResearchService');

// Black Box — product market search.
const products = asyncHandler(async (req, res) => {
  const rows = productResearch.searchProducts(req.body || {});
  res.json({ success: true, data: rows });
});

// Black Box — competitor lookup by ASIN.
const competitors = asyncHandler(async (req, res) => {
  const { asin, filters } = req.body || {};
  const result = productResearch.findCompetitors(asin, filters || {});
  res.json({ success: true, data: result });
});

// Black Box — keyword market search.
const keywords = asyncHandler(async (req, res) => {
  const rows = await productResearch.searchKeywords(req.body || {});
  res.json({ success: true, data: rows });
});

// Black Box — niche (market segment by phrase).
const niche = asyncHandler(async (req, res) => {
  const { phrase, filters } = req.body || {};
  const rows = productResearch.searchNiche(phrase, filters || {});
  res.json({ success: true, data: rows });
});

// Black Box — product targeting (related products by ASIN).
const targeting = asyncHandler(async (req, res) => {
  const { asins, source, filters } = req.body || {};
  const result = productResearch.searchTargeting(asins, source, filters || {});
  res.json({ success: true, data: result });
});

// Black Box — Elite Analytics (segment-level report for a phrase).
const analytics = asyncHandler(async (req, res) => {
  const { phrase, filters } = req.body || {};
  const result = productResearch.nicheAnalytics(phrase, filters || {});
  res.json({ success: true, data: result });
});

// Filter metadata (categories, size classes, targeting sources).
const meta = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      categories: productResearch.categories(),
      sizeTiers: productResearch.sizeTiers(),
      targetSources: productResearch.targetSources(),
    },
  });
});

module.exports = { products, competitors, keywords, niche, targeting, analytics, meta };
