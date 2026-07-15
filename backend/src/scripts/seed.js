/**
 * Seeds the database with a demo user, products, keywords, campaigns, and a
 * trailing 30 days of sales/PPC/ranking/competitor data so the whole app can be
 * demoed without live Amazon credentials.
 *
 * Usage: node src/scripts/seed.js
 */
require('dotenv').config();
const { sequelize, User, Product, Keyword, Competitor, PPCCampaign } = require('../models');
const amazonService = require('../services/amazonService');
const profitService = require('../services/profitService');
const ppcService = require('../services/ppcService');
const rankingService = require('../services/rankingService');
const priceOptimizer = require('../services/priceOptimizer');
const autoBot = require('../services/autoBot');
const logger = require('../utils/logger');

const DEMO_EMAIL = 'demo@maios.app';

async function seed() {
  await sequelize.sync({ alter: true });

  await User.destroy({ where: { email: DEMO_EMAIL } });
  const passwordHash = await User.hashPassword('demo1234');
  const user = await User.create({
    email: DEMO_EMAIL,
    passwordHash,
    username: 'Demo Seller',
    currency: 'EUR',
    timezone: 'Europe/Berlin',
  });
  logger.info(`Created demo user ${DEMO_EMAIL} / demo1234`);

  const productDefs = [
    { asin: 'B0DEMO0001', sku: 'GT-100', title: 'Organic Green Tea 100 Bags', category: 'Grocery', price: 14.99, costPerUnit: 4.2, fbaStock: 328, fbmStock: 0 },
    { asin: 'B0DEMO0002', sku: 'WB-1L', title: 'Stainless Steel Water Bottle 1L', category: 'Sports', price: 24.99, costPerUnit: 7.5, fbaStock: 119, fbmStock: 40 },
    { asin: 'B0DEMO0003', sku: 'BC-SET', title: 'Bamboo Cutting Board Set', category: 'Kitchen', price: 32.5, costPerUnit: 11.0, fbaStock: 75, fbmStock: 12 },
  ];

  for (const def of productDefs) {
    const product = await Product.create({ userId: user.id, ...def });

    // Keywords
    const kwList = await keywordService(product);
    // Competitors
    const comp = await Competitor.create({
      productId: product.id,
      marketplace: 'amazon',
      competitorAsin: `C${def.asin.slice(1)}`,
      competitorTitle: `Rival ${def.title}`,
      status: 'active',
    });

    // Campaign
    const campaign = await PPCCampaign.create({
      productId: product.id,
      campaignName: `${def.title} - Auto SP`,
      campaignType: 'sp',
      dailyBudget: Number((def.price * 2).toFixed(2)),
      targetAcos: 25,
      status: 'active',
    });

    // Backfill 30 days of data.
    for (let d = 29; d >= 0; d -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      const dateStr = date.toISOString().slice(0, 10);

      const sales = await amazonService.getSalesData(def.asin, date);
      await profitService.calculateDailyProfit(product.id, {
        marketplace: 'amazon',
        saleDate: dateStr,
        unitsSold: sales.unitsSold,
        price: sales.price,
        grossRevenue: sales.grossRevenue,
        refunds: sales.refunds,
        refundedAmount: sales.refundedAmount,
        referralFee: sales.referralFee,
        fbaFee: sales.fbaFee,
        ppcSpend: sales.ppcSpend,
      });

      const ppc = await amazonService.getPPCData(campaign, date);
      await ppcService.recordPerformance(campaign.id, { performanceDate: dateStr, ...ppc });

      await priceOptimizer.refreshCompetitorPrices(product.id, 'amazon', date);

      for (const kw of kwList) {
        await rankingService.trackKeywordRanking(kw, 'amazon', date);
      }
    }
    logger.info(`Seeded product ${def.title} with 30 days of data`);
  }

  // Generate alerts from the seeded data.
  await autoBot.run();
  logger.info('Seed complete.');
}

async function keywordService(product) {
  const seeds = product.title
    .toLowerCase()
    .split(' ')
    .slice(0, 3)
    .map((w) => w.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const phrases = [seeds.join(' '), `best ${seeds.join(' ')}`, `${seeds.join(' ')} set`];
  const created = [];
  for (const phrase of phrases) {
    const m = amazonService.seeded(phrase);
    created.push(
      await Keyword.create({
        productId: product.id,
        keyword: phrase,
        keywordType: 'organic',
        searchVolume: Math.round(500 + m * 20000),
        cpc: Number((0.3 + m * 2).toFixed(2)),
        difficultyScore: Math.round(20 + m * 70),
      })
    );
  }
  return created;
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(err.stack || err.message);
    process.exit(1);
  });
