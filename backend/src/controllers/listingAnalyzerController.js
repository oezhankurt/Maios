const listingAnalyzerService = require('../services/listingAnalyzerService');

async function analyzeMain(req, res) {
  try {
    const { mainAsin } = req.body;
    const result = await listingAnalyzerService.analyzeMainProduct(mainAsin);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function addCompetitors(req, res) {
  try {
    const { mainAsin, competitorAsins } = req.body;
    const result = await listingAnalyzerService.addCompetitors(mainAsin, competitorAsins);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  analyzeMain,
  addCompetitors,
};
