const indexCheckerService = require('../services/indexCheckerService');

async function checkKeyword(req, res) {
  try {
    const { asin, keyword } = req.body;
    const result = await indexCheckerService.checkKeyword(asin, keyword);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function checkKeywords(req, res) {
  try {
    const { asin, keywords } = req.body;
    const result = await indexCheckerService.checkKeywords(asin, keywords);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function trackRankings(req, res) {
  try {
    const { asin, keywords, days } = req.body;
    const result = await indexCheckerService.trackRankings(asin, keywords, days);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  checkKeyword,
  checkKeywords,
  trackRankings,
};
