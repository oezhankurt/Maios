const schedule = require('node-schedule');
const logger = require('../utils/logger');
const { Product, PPCCampaign, Keyword, User } = require('../models');
const amazonService = require('../services/amazonService');
const profitService = require('../services/profitService');
const ppcService = require('../services/ppcService');
const rankingService = require('../services/rankingService');
const priceOptimizer = require('../services/priceOptimizer');
const smartPortfolioService = require('../services/smartPortfolioService');
const autoBot = require('../services/autoBot');
const config = require('../config');

const jobs = [];

/** 2 AM daily: pull a full day of sales + PPC data and recompute profit. */
async function fullDataSync() {
  logger.info('Scheduler: full data sync started');
  const products = await Product.findAll({ where: { status: 'active' } });
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  for (const product of products) {
    if (!product.asin) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      const sales = await amazonService.getSalesData(product.asin, yesterday);
      // eslint-disable-next-line no-await-in-loop
      await profitService.calculateDailyProfit(product.id, {
        marketplace: 'amazon',
        saleDate: yesterday.toISOString().slice(0, 10),
        unitsSold: sales.unitsSold,
        price: sales.price,
        grossRevenue: sales.grossRevenue,
        refunds: sales.refunds,
        refundedAmount: sales.refundedAmount,
        referralFee: sales.referralFee,
        fbaFee: sales.fbaFee,
        ppcSpend: sales.ppcSpend,
      });
    } catch (err) {
      logger.error(`Sync failed for product ${product.id}: ${err.message}`);
    }
  }

  const campaigns = await PPCCampaign.findAll({ where: { status: 'active' } });
  for (const c of campaigns) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await ppcService.syncPerformance(c, yesterday);
    } catch (err) {
      logger.error(`PPC sync failed for campaign ${c.id}: ${err.message}`);
    }
  }
  logger.info('Scheduler: full data sync complete');
}

/** Hourly: track keyword rankings across marketplaces. */
async function trackRankings() {
  logger.info('Scheduler: tracking keyword rankings');
  const keywords = await Keyword.findAll({ where: { status: 'active' } });
  for (const kw of keywords) {
    for (const marketplace of config.marketplaces) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await rankingService.trackKeywordRanking(kw, marketplace);
      } catch (err) {
        logger.error(`Ranking track failed (kw ${kw.id}, ${marketplace}): ${err.message}`);
      }
    }
  }
}

/** Every 4 hours: refresh competitor prices and apply price recommendations. */
async function optimizePrices() {
  logger.info('Scheduler: optimizing prices');
  const products = await Product.findAll({ where: { status: 'active' } });
  for (const product of products) {
    for (const marketplace of config.marketplaces) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await priceOptimizer.refreshCompetitorPrices(product.id, marketplace);
      } catch (err) {
        logger.error(`Price refresh failed (product ${product.id}): ${err.message}`);
      }
    }
  }
}

/**
 * Every 4 hours: run the Smart Portfolio automation per user (apply
 * Campaign-Mover rules, then target-ACoS optimize each portfolio), and
 * optimize any remaining loose campaigns.
 */
async function optimizePPC() {
  logger.info('Scheduler: running Smart Portfolio automation + PPC bids');
  try {
    const users = await User.findAll({ where: { status: 'active' }, attributes: ['id'] });
    for (const u of users) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await smartPortfolioService.applyRules(u.id);
        // eslint-disable-next-line no-await-in-loop
        await smartPortfolioService.optimizeAllPortfolios(u.id);
      } catch (err) {
        logger.error(`Smart Portfolio automation failed for user ${u.id}: ${err.message}`);
      }
    }
    await ppcService.optimizeAll(null);
  } catch (err) {
    logger.error(`PPC optimization failed: ${err.message}`);
  }
}

/** Every 6 hours: run the automation engine to raise alerts. */
async function checkAlerts() {
  try {
    await autoBot.run();
  } catch (err) {
    logger.error(`Alert check failed: ${err.message}`);
  }
}

function start() {
  jobs.push(schedule.scheduleJob('full-sync', '0 2 * * *', fullDataSync));
  jobs.push(schedule.scheduleJob('track-rankings', '0 * * * *', trackRankings));
  jobs.push(schedule.scheduleJob('optimize-prices', '0 */4 * * *', optimizePrices));
  jobs.push(schedule.scheduleJob('optimize-ppc', '30 */4 * * *', optimizePPC));
  jobs.push(schedule.scheduleJob('check-alerts', '0 */6 * * *', checkAlerts));
  logger.info(`Scheduler started with ${jobs.filter(Boolean).length} jobs.`);
}

function stop() {
  jobs.forEach((job) => job && job.cancel());
  logger.info('Scheduler stopped.');
}

module.exports = {
  start,
  stop,
  // Exported for manual triggering / testing.
  fullDataSync,
  trackRankings,
  optimizePrices,
  optimizePPC,
  checkAlerts,
};
