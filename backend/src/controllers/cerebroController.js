const asyncHandler = require('../utils/asyncHandler');
const cerebro = require('../services/cerebroService');

// Cerebro — search by ASINs (reverse) or a keyword (Magnet).
const search = asyncHandler(async (req, res) => {
  const { asins, keyword } = req.body || {};
  if (Array.isArray(asins) && asins.length) {
    return res.json({ success: true, data: cerebro.reverseAsin(asins) });
  }
  return res.json({ success: true, data: cerebro.keywordSearch(keyword) });
});

// Cerebro — analyze a pasted keyword list.
const analyze = asyncHandler(async (req, res) => {
  const { keywords } = req.body || {};
  res.json({ success: true, data: cerebro.analyzeKeywords(keywords || []) });
});

module.exports = { search, analyze };
