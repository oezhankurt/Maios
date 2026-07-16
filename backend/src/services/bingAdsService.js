const { seeded } = require('./amazonService');

/**
 * Bing Ads Management: Kampagnen, Keywords, Performance Tracking
 */

function generateBingCampaign(campaignId, seed = campaignId) {
  const r = seeded(seed);
  const statuses = ['Aktiv', 'Pausiert', 'Beendet'];

  return {
    id: campaignId,
    name: `Bing Kampagne ${campaignId.slice(-4)}`,
    status: statuses[Math.floor(r * statuses.length)],
    budget: Math.round(r * 3000) + 300,
    spent: Math.round(r * 2000),
    clicks: Math.floor(r * 3000),
    impressions: Math.floor(r * 80000),
    conversions: Math.floor(r * 120),
    ctr: (r * 6 + 0.4).toFixed(2),
    avgCpc: (r * 2.5 + 0.4).toFixed(2),
    roas: (r * 4 + 1.2).toFixed(2),
    marginOfProfitability: (r * 30 + 20).toFixed(1),
  };
}

async function getCampaigns(filters = {}) {
  const campaigns = [];
  for (let i = 1; i <= 5; i++) {
    campaigns.push(generateBingCampaign(`BING-${i}`));
  }

  if (filters.status) {
    return campaigns.filter((c) => c.status === filters.status);
  }

  return campaigns;
}

async function getCampaign(id) {
  return generateBingCampaign(id);
}

async function getKeywords(campaignId) {
  const keywords = [];
  const baseKeywords = [
    'health supplements',
    'vitamin supplements',
    'natural health products',
    'wellness supplements',
    'organic vitamins',
  ];

  baseKeywords.forEach((kw, idx) => {
    const seed = `${campaignId}|${kw}|${idx}`;
    const r = seeded(seed);
    keywords.push({
      keyword: kw,
      bid: (r * 2.5 + 0.3).toFixed(2),
      status: r > 0.3 ? 'Aktiv' : 'Pausiert',
      clicks: Math.floor(r * 400),
      impressions: Math.floor(r * 8000),
      conversions: Math.floor(r * 40),
      ctr: (r * 6 + 0.4).toFixed(2),
      avgCpc: (r * 2 + 0.25).toFixed(2),
      conversionRate: (r * 15 + 5).toFixed(2),
    });
  });

  return keywords;
}

async function getPerformance(campaignId, dateRange = '30') {
  const r = seeded(`${campaignId}|${dateRange}`);

  return {
    campaignId,
    platform: 'Bing Ads',
    dateRange: `Last ${dateRange} days`,
    summary: {
      impressions: Math.floor(r * 80000),
      clicks: Math.floor(r * 3000),
      conversions: Math.floor(r * 120),
      spend: Math.round(r * 2000),
      revenue: Math.round(r * 10000),
      roas: (r * 4 + 1.2).toFixed(2),
    },
    comparison: {
      googleAdsRoas: 4.2,
      bingAdsRoas: (r * 4 + 1.2).toFixed(2),
      verdict: r > 0.5 ? 'Bing performt besser' : 'Google Ads performt besser',
    },
    topKeywords: [
      {
        keyword: 'health supplements',
        conversions: Math.floor(r * 50),
        conversionRate: (r * 12 + 8).toFixed(1),
      },
      {
        keyword: 'vitamin supplements',
        conversions: Math.floor(r * 40),
        conversionRate: (r * 10 + 6).toFixed(1),
      },
      {
        keyword: 'wellness supplements',
        conversions: Math.floor(r * 30),
        conversionRate: (r * 8 + 4).toFixed(1),
      },
    ],
  };
}

async function suggestOptimizations(campaignId) {
  const r = seeded(`optimize|${campaignId}`);

  return {
    campaignId,
    platform: 'Bing Ads',
    suggestions: [
      {
        type: 'Keyword Expansion',
        detail: 'Add high-intent keywords from search term report',
        priority: 'High',
        estimatedImprovement: '+15% clicks',
      },
      {
        type: 'Bid Optimization',
        detail: 'Increase bids on top-converting keywords',
        priority: 'High',
        estimatedImprovement: '+8% conversions',
      },
      {
        type: 'Ad Copy Testing',
        detail: 'Test new ad headlines for better CTR',
        priority: 'Medium',
        estimatedImprovement: '+3% CTR',
      },
      {
        type: 'Audience Targeting',
        detail: 'Use in-market audiences for better targeting',
        priority: 'Medium',
        estimatedImprovement: '+5% conversion rate',
      },
    ],
  };
}

module.exports = {
  getCampaigns,
  getCampaign,
  getKeywords,
  getPerformance,
  suggestOptimizations,
};
