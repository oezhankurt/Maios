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

// Category list for the filter dropdowns.
const meta = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { categories: productResearch.categories() } });
});

module.exports = { products, competitors, keywords, meta };
