/**
 * ASIN Sync Worker
 * Läuft täglich: Zieht Amazon-Daten von Supermetrics → speichert in DB
 */
const { User, Product, DailyMetrics } = require('../models');
const supermetricsService = require('../services/supermetricsService');
const logger = require('../utils/logger');

class AsinSyncWorker {
  async run() {
    if (!supermetricsService.isConfigured()) {
      logger.info('🔇 Supermetrics nicht konfiguriert - Sync übersprungen');
      return;
    }

    try {
      logger.info('🔄 Starte ASIN-Sync...');
      const startTime = Date.now();

      // Hole Sync-User aus Env
      const syncUserEmail = process.env.ASIN_SYNC_USER_EMAIL;
      if (!syncUserEmail) {
        throw new Error('ASIN_SYNC_USER_EMAIL nicht in .env gesetzt');
      }

      // Finde oder erstelle Sync-User
      let user = await User.findOne({ where: { email: syncUserEmail } });
      if (!user) {
        logger.warn(`Sync-User ${syncUserEmail} existiert nicht - überspringen`);
        return;
      }

      // Hole Daten von Supermetrics
      const salesData = await supermetricsService.fetchSalesData(30);
      if (!salesData || !salesData.rows) {
        throw new Error('Keine Daten von Supermetrics erhalten');
      }

      // Parse Produkte
      const productsList = supermetricsService.parseProductsFromSalesData(salesData.rows);
      const dailyMetrics = supermetricsService.parseDailyMetrics(salesData.rows);

      logger.info(`📦 ${productsList.length} Produkte, ${dailyMetrics.length} Metrik-Einträge`);

      // Sync Produkte
      for (const prod of productsList) {
        const [product, created] = await Product.findOrCreate({
          where: {
            userId: user.id,
            asin: prod.asin,
          },
          defaults: {
            title: prod.title,
            sku: prod.sku,
            marketplace: prod.marketplace,
            price: 0,
            costPerUnit: 0,
            status: 'active',
          },
        });

        if (!created && prod.title) {
          await product.update({ title: prod.title });
        }

        logger.debug(`  ✓ Produkt ${prod.asin}: ${prod.title}`);
      }

      // Sync tägliche Metriken
      let metricsCreated = 0;
      for (const metric of dailyMetrics) {
        const product = await Product.findOne({
          where: {
            userId: user.id,
            asin: metric.asin,
          },
        });

        if (!product) continue;

        // Aktualisiere oder erstelle Metrik
        await DailyMetrics.findOrCreate({
          where: {
            productId: product.id,
            date: metric.date,
          },
          defaults: {
            sessions: metric.sessions,
            pageViews: metric.pageViews,
            buyBoxPercentage: metric.buyBoxPercentage,
            unitsOrdered: metric.unitsOrdered,
            orderedProductSales: metric.orderedProductSales,
            advertisingSpend: metric.advertisingSpend,
            advertisingClicks: metric.advertisingClicks,
            advertisingImpressions: metric.advertisingImpressions,
          },
        });

        metricsCreated++;
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      logger.info(`✅ ASIN-Sync erfolgreich (${duration}s): ${productsList.length} Produkte, ${metricsCreated} Metriken`);

      return {
        success: true,
        productsCount: productsList.length,
        metricsCount: metricsCreated,
        duration,
      };
    } catch (err) {
      logger.error(`❌ ASIN-Sync Fehler: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new AsinSyncWorker();
