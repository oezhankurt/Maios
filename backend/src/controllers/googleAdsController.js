const googleAdsService = require('../services/googleAdsService');

async function getCampaigns(req, res) {
  try {
    const { status } = req.query;
    const campaigns = await googleAdsService.getCampaigns({ status });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCampaign(req, res) {
  try {
    const { id } = req.params;
    const campaign = await googleAdsService.getCampaign(id);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getKeywords(req, res) {
  try {
    const { campaignId } = req.query;
    const keywords = await googleAdsService.getKeywords(campaignId);
    res.json(keywords);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function optimizeKeywords(req, res) {
  try {
    const { campaignId, keywords } = req.body;
    const result = await googleAdsService.optimizeKeywords(campaignId, keywords);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getBudgetAllocation(req, res) {
  try {
    const accountId = 'default';
    const result = await googleAdsService.getBudgetAllocation(accountId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getPerformanceReport(req, res) {
  try {
    const { campaignId, dateRange } = req.query;
    const result = await googleAdsService.getPerformanceReport(campaignId, dateRange || '30');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getCampaigns,
  getCampaign,
  getKeywords,
  optimizeKeywords,
  getBudgetAllocation,
  getPerformanceReport,
};
