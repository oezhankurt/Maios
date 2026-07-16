const scribbleService = require('../services/scribbleService');

async function optimizeTitle(req, res) {
  try {
    const { asin, keywords } = req.body;
    const result = await scribbleService.optimizeTitle(asin, keywords);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function optimizeBullets(req, res) {
  try {
    const { asin, keywords } = req.body;
    const result = await scribbleService.optimizeBullets(asin, keywords);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function optimizeDescription(req, res) {
  try {
    const { asin, keywords } = req.body;
    const result = await scribbleService.optimizeDescription(asin, keywords);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function analyzeContent(req, res) {
  try {
    const { asin, field, text, keywords } = req.body;
    const result = await scribbleService.analyzeContent(asin, field, text, keywords);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  optimizeTitle,
  optimizeBullets,
  optimizeDescription,
  analyzeContent,
};
