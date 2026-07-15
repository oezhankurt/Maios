const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * amazonService wraps the Amazon SP-API and Advertising API.
 *
 * When live credentials are configured it exchanges the refresh token for an
 * access token and calls the real endpoints. Without credentials (local dev,
 * demo) it returns deterministic synthetic data derived from the ASIN so the
 * rest of the pipeline — profit, PPC, rankings — can be exercised end to end.
 */

const LWA_TOKEN_URL = 'https://api.amazon.com/auth/o2/token';

function hasCredentials() {
  return Boolean(config.amazon.clientId && config.amazon.clientSecret && config.amazon.refreshToken);
}

// Deterministic pseudo-random in [0,1) seeded by a string, so demo data is
// stable across runs for a given ASIN/date.
function seeded(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

async function connectAmazonAccount(credentials) {
  // Exchange a Login-with-Amazon refresh token for an access token.
  if (!credentials || !credentials.refreshToken) {
    throw new Error('refreshToken is required to connect an Amazon account');
  }
  try {
    const { data } = await axios.post(LWA_TOKEN_URL, {
      grant_type: 'refresh_token',
      refresh_token: credentials.refreshToken,
      client_id: credentials.clientId || config.amazon.clientId,
      client_secret: credentials.clientSecret || config.amazon.clientSecret,
    });
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || credentials.refreshToken,
      expiresIn: data.expires_in,
      sellerId: credentials.sellerId || null,
    };
  } catch (err) {
    logger.error(`Amazon connect failed: ${err.message}`);
    throw new Error('Failed to connect Amazon account');
  }
}

async function getAccessToken() {
  const res = await connectAmazonAccount({ refreshToken: config.amazon.refreshToken });
  return res.accessToken;
}

/**
 * Returns a day's sales snapshot for an ASIN. Falls back to synthetic data.
 */
async function getSalesData(asin, date = new Date()) {
  const dateStr = date.toISOString().slice(0, 10);
  if (!hasCredentials()) {
    const r = seeded(`${asin}-${dateStr}`);
    const units = Math.round(5 + r * 40);
    const price = Number((15 + seeded(asin) * 40).toFixed(2));
    const gross = Number((units * price).toFixed(2));
    // A small share of orders get refunded.
    const refunds = Math.round(units * (r * 0.06));
    const refundedAmount = Number((refunds * price).toFixed(2));
    return {
      asin,
      date: dateStr,
      unitsSold: units,
      price,
      grossRevenue: gross,
      refunds,
      refundedAmount,
      referralFee: Number((gross * 0.15).toFixed(2)),
      fbaFee: Number((units * 3.2).toFixed(2)),
      ppcSpend: Number((gross * (0.08 + r * 0.12)).toFixed(2)),
    };
  }
  // Live path: query SP-API Orders / Finances. Placeholder for the real call.
  const token = await getAccessToken();
  logger.info(`Fetching live SP-API sales for ${asin} (token acquired)`);
  const { data } = await axios.get(
    `https://sellingpartnerapi-${config.amazon.region}.amazon.com/orders/v0/orders`,
    {
      params: { MarketplaceIds: config.amazon.marketplaceId, CreatedAfter: dateStr },
      headers: { 'x-amz-access-token': token },
    }
  );
  return data;
}

/**
 * Returns a day's PPC performance for a campaign. Falls back to synthetic data.
 */
async function getPPCData(campaign, date = new Date()) {
  const dateStr = date.toISOString().slice(0, 10);
  if (!hasCredentials()) {
    const r = seeded(`${campaign.id || campaign.campaignName}-${dateStr}`);
    const impressions = Math.round(1000 + r * 9000);
    const clicks = Math.round(impressions * (0.003 + r * 0.02));
    const spend = Number((clicks * (0.3 + r * 0.9)).toFixed(2));
    const unitsSold = Math.round(clicks * (0.05 + r * 0.15));
    const sales = Number((unitsSold * (18 + seeded(String(campaign.id)) * 30)).toFixed(2));
    return { date: dateStr, impressions, clicks, spend, sales, unitsSold };
  }
  const token = await getAccessToken();
  logger.info(`Fetching live Advertising API data for campaign ${campaign.id}`);
  const { data } = await axios.get(
    'https://advertising-api-eu.amazon.com/v2/sp/campaigns/report',
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}

async function getAccountMetrics() {
  if (!hasCredentials()) {
    return {
      connected: false,
      sellerId: null,
      note: 'Running in demo mode — configure AMAZON_* env vars for live data.',
    };
  }
  return { connected: true, sellerId: config.amazon.marketplaceId };
}

module.exports = {
  hasCredentials,
  connectAmazonAccount,
  getSalesData,
  getPPCData,
  getAccountMetrics,
  seeded,
};
