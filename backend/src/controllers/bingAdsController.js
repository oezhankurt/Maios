const bingAdsService = require('../services/bingAdsService');

async function getCampaigns(req, res) {
  try {
    const { status } = req.query;
    const campaigns = await bingAdsService.getCampaigns({ status });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCampaign(req, res) {
  try {
    const { id } = req.params;
    const campaign = await bingAdsService.getCampaign(id);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getKeywords(req, res) {
  try {
    const { campaignId } = req.query;
    const keywords = await bingAdsService.getKeywords(campaignId);
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPerformance(req, res) {
  try {
    const { campaignId, dateRange } = req.query;
    const result = await bingAdsService.getPerformance(campaignId, dateRange || '30');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function suggestOptimizations(req, res) {
  try {
    const { campaignId } = req.body;
    const result = await bingAdsService.suggestOptimizations(campaignId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCampaigns,
  getCampaign,
  getKeywords,
  getPerformance,
  suggestOptimizations,
};
