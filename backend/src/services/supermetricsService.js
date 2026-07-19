/**
 * Supermetrics Integration Service
 * Zieht Amazon Seller Central Daten automatisch via Supermetrics-API
 */
const axios = require('axios');
const logger = require('../utils/logger');

const SUPERMETRICS_API_URL = 'https://api.supermetrics.com/v2';

class SupermetricsService {
  constructor() {
    this.apiKey = process.env.SUPERMETRICS_API_KEY;
    this.dsUser = process.env.SUPERMETRICS_DS_USER;
    this.marketplace = process.env.SUPERMETRICS_MARKETPLACE || 'A1PA6795UKMFR9';
    this.enabled = process.env.ASIN_SYNC_ENABLED === 'true';
  }

  isConfigured() {
    return this.enabled && this.apiKey && this.dsUser;
  }

  /**
   * Holt Sales & Traffic Daten für eine bestimmte Anzahl von Tagen
   */
  async fetchSalesData(days = 30) {
    if (!this.isConfigured()) {
      logger.warn('Supermetrics nicht konfiguriert - überspringe Sync');
      return null;
    }

    try {
      logger.info(`Hole Amazon Sales-Daten für die letzten ${days} Tage...`);

      const payload = {
        datasource_id: 144, // Amazon Seller Central
        days_compare: -1,
        dimensions: ['date', 'product_name', 'asin', 'sku', 'parent_asin'],
        metrics: [
          'sessions',
          'session_percentage',
          'page_views',
          'page_view_percentage',
          'buy_box_percentage',
          'units_ordered',
          'units_ordered_b2b',
          'ordered_product_sales',
          'ordered_product_sales_b2b',
          'total_advertising_cost',
          'advertising_cost_of_sales',
          'advertising_cost_of_sales_b2b',
          'advertising_clicks',
          'advertising_impressions',
          'advertising_ctr',
          'advertising_cpc',
          'advertising_spend',
          'advertising_14_day_total_sales',
          'advertising_14_day_total_sales_b2b',
        ],
        account: this.dsUser,
      };

      const response = await axios.post(
        `${SUPERMETRICS_API_URL}/query/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.status !== 'Success') {
        throw new Error(`Supermetrics Error: ${response.data.message}`);
      }

      logger.info(`✅ Supermetrics: ${response.data.data.rows.length} Zeilen geholt`);
      return response.data.data;
    } catch (err) {
      logger.error(`Supermetrics API Fehler: ${err.message}`);
      throw err;
    }
  }

  /**
   * Holt Ranking/Index-Daten für Keywords
   */
  async fetchRankingData(days = 30) {
    if (!this.isConfigured()) return null;

    try {
      logger.info('Hole Ranking-Daten...');

      const payload = {
        datasource_id: 145, // Amazon Brand Analytics / Keyword Rankings
        days_compare: -1,
        dimensions: ['date', 'keyword', 'search_frequency_rank'],
        metrics: ['search_frequency', 'relative_sales_share', 'advertising_spend'],
        account: this.dsUser,
      };

      const response = await axios.post(
        `${SUPERMETRICS_API_URL}/query/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000,
        }
      );

      if (response.data.status !== 'Success') {
        throw new Error(`Supermetrics Rankings Error: ${response.data.message}`);
      }

      logger.info(`✅ Supermetrics Rankings: ${response.data.data.rows.length} Zeilen`);
      return response.data.data;
    } catch (err) {
      logger.error(`Supermetrics Rankings Fehler: ${err.message}`);
      throw err;
    }
  }

  /**
   * Parsed Supermetrics Daten in Maios-Format
   */
  parseProductsFromSalesData(rows) {
    const products = new Map();

    rows.forEach((row) => {
      const asin = row.asin?.[0];
      const sku = row.sku?.[0];
      const title = row.product_name?.[0];

      if (!asin) return;

      if (!products.has(asin)) {
        products.set(asin, {
          asin,
          sku: sku || null,
          title: title || 'Unbekanntes Produkt',
          marketplace: this.marketplace,
          // Metadaten aus aktuellstem Datum
          lastUpdated: new Date(),
        });
      }
    });

    return Array.from(products.values());
  }

  /**
   * Extrakt tägliche Metriken aus Supermetrics Rohdaten
   */
  parseDailyMetrics(rows) {
    const dailyData = new Map();

    rows.forEach((row) => {
      const date = row.date?.[0];
      const asin = row.asin?.[0];

      if (!date || !asin) return;

      const key = `${date}_${asin}`;

      if (!dailyData.has(key)) {
        dailyData.set(key, {
          date: new Date(date),
          asin,
          sessions: parseInt(row.sessions?.[0]) || 0,
          pageViews: parseInt(row.page_views?.[0]) || 0,
          buyBoxPercentage: parseFloat(row.buy_box_percentage?.[0]) || 0,
          unitsOrdered: parseInt(row.units_ordered?.[0]) || 0,
          orderedProductSales: parseFloat(row.ordered_product_sales?.[0]) || 0,
          advertisingSpend: parseFloat(row.advertising_spend?.[0]) || 0,
          advertisingClicks: parseInt(row.advertising_clicks?.[0]) || 0,
          advertisingImpressions: parseInt(row.advertising_impressions?.[0]) || 0,
        });
      }
    });

    return Array.from(dailyData.values());
  }
}

module.exports = new SupermetricsService();
