const { seeded } = require('./amazonService');

/**
 * Google Ads Management: Kampagnen, Keywords, Bidding, Budget Allocation
 */

function generateCampaign(campaignId, seed = campaignId) {
  const r = seeded(seed);
  const statuses = ['Aktiv', 'Pausiert', 'Beendet'];
  const types = ['Suchkampagne', 'Display', 'Shopping', 'Video'];

  return {
    id: campaignId,
    name: `Kampagne ${campaignId.slice(-4)}`,
    type: types[Math.floor(r * types.length)],
    status: statuses[Math.floor(r * statuses.length)],
    budget: Math.round(r * 5000) + 500,
    spent: Math.round(r * 3000),
    clicks: Math.floor(r * 5000),
    impressions: Math.floor(r * 100000),
    conversions: Math.floor(r * 200),
    ctr: (r * 8 + 0.5).toFixed(2),
    avgCpc: (r * 3 + 0.5).toFixed(2),
    roas: (r * 5 + 1).toFixed(2),
  };
}

async function getCampaigns(filters = {}) {
  const campaigns = [];
  for (let i = 1; i <= 8; i++) {
    campaigns.push(generateCampaign(`CAMP-${i}`));
  }

  if (filters.status) {
    return campaigns.filter((c) => c.status === filters.status);
  }

  return campaigns;
}

async function getCampaign(id) {
  return generateCampaign(id);
}

async function getKeywords(campaignId, filters = {}) {
  const keywords = [];
  const baseKeywords = [
    'magnesium supplement',
    'vitamin d3',
    'omega 3 fish oil',
    'ashwagandha',
    'probiotics',
  ];

  baseKeywords.forEach((kw, idx) => {
    const seed = `${campaignId}|${kw}|${idx}`;
    const r = seeded(seed);
    keywords.push({
      keyword: kw,
      matchType: ['Exact', 'Phrase', 'Broad'][Math.floor(r * 3)],
      bid: (r * 3 + 0.2).toFixed(2),
      quality: Math.floor(r * 10),
      status: r > 0.2 ? 'Aktiv' : 'Pausiert',
      clicks: Math.floor(r * 500),
      impressions: Math.floor(r * 10000),
      conversions: Math.floor(r * 50),
      ctr: (r * 5 + 0.5).toFixed(2),
      avgCpc: (r * 2 + 0.3).toFixed(2),
    });
  });

  return keywords;
}

async function optimizeKeywords(campaignId, keywords = []) {
  const r = seeded(`optimize|${campaignId}`);

  return {
    campaignId,
    recommendations: [
      {
        type: 'Bid Increase',
        keywords: keywords.slice(0, 2),
        reason: 'High Quality Score & Low Conversion Cost',
        suggestion: 'Increase bid by 15%',
        estimatedImpact: '+23% conversions',
      },
      {
        type: 'Bid Decrease',
        keywords: keywords.slice(2, 4),
        reason: 'High CPC, Low Conversion Rate',
        suggestion: 'Decrease bid by 10%',
        estimatedImpact: 'Save €50/day',
      },
      {
        type: 'Add Keywords',
        keywords: [],
        reason: 'High-Intent Keywords Missing',
        suggestion: 'Add: "best magnesium supplement", "magnesium glycinate"',
        estimatedImpact: '+100 clicks/day',
      },
    ],
  };
}

async function getBudgetAllocation(accountId) {
  const r = seeded(accountId);

  return {
    accountId,
    totalBudget: 5000,
    allocated: 3500,
    available: 1500,
    campaigns: [
      {
        name: 'Top Performers',
        budget: 1500,
        allocation: '42.8%',
        roas: 5.2,
      },
      {
        name: 'Growth Keywords',
        budget: 1200,
        allocation: '34.2%',
        roas: 3.1,
      },
      {
        name: 'Brand Protection',
        budget: 800,
        allocation: '22.8%',
        roas: 2.8,
      },
    ],
    recommendations: [
      'Allocate €200 more to Top Performers (ROAS 5.2)',
      'Reduce Brand Protection by €150 (ROAS 2.8)',
      'Test Budget Shift: +10% to Growth Keywords',
    ],
  };
}

async function getPerformanceReport(campaignId, dateRange = '30') {
  const r = seeded(`${campaignId}|${dateRange}`);

  return {
    campaignId,
    dateRange: `Last ${dateRange} days`,
    metrics: {
      impressions: Math.floor(r * 100000),
      clicks: Math.floor(r * 5000),
      conversions: Math.floor(r * 200),
      spend: Math.round(r * 3000),
      revenue: Math.round(r * 15000),
      roas: (r * 5 + 1).toFixed(2),
      ctr: (r * 8 + 0.5).toFixed(2),
      avgCpc: (r * 3 + 0.5).toFixed(2),
      avgConversionValue: (r * 50 + 10).toFixed(2),
    },
    trends: {
      impressionsTrend: Math.floor(r * 20) - 10,
      conversionsTrend: Math.floor(r * 30) - 10,
      roasTrend: (r * 2 - 1).toFixed(1),
    },
  };
}

module.exports = {
  getCampaigns,
  getCampaign,
  getKeywords,
  optimizeKeywords,
  getBudgetAllocation,
  getPerformanceReport,
};
