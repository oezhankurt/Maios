const { Op } = require('sequelize');
const {
  Product,
  DailySales,
  Keyword,
  KeywordRanking,
  PPCCampaign,
  PPCPerformance,
} = require('../models');
const ppcService = require('./ppcService');
const priceOptimizer = require('./priceOptimizer');
const rankingService = require('./rankingService');

/**
 * Product diagnostics engine.
 *
 * Gathers the signals we have (sales trend, margin, ACoS, ranking trend,
 * price vs competitors, stock cover, refund rate, keyword coverage) and turns
 * them into a health score plus a prioritised list of concrete recommendations
 * — the "why isn't it selling and what to do" view.
 *
 * It is deliberately rule-based and transparent. Each recommendation names the
 * signal that triggered it, so the advice is explainable. When richer data
 * (sessions, conversion rate, Buy Box) arrives via the Amazon APIs, new rules
 * plug straight in here.
 */

const TARGET_ACOS = 25; // default target until per-product targets exist
const SEVERITY_WEIGHT = { critical: 28, warning: 14, info: 6 };

function iso(d) {
  return d.toISOString().slice(0, 10);
}

async function gatherSignals(product) {
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(start30.getDate() - 29);

  const sales = await DailySales.findAll({
    where: { productId: product.id, saleDate: { [Op.between]: [iso(start30), iso(now)] } },
    order: [['saleDate', 'ASC']],
  });

  const sum = (rows, f) => rows.reduce((a, r) => a + f(r), 0);
  const last7 = sales.filter((r) => new Date(r.saleDate) >= new Date(now.getTime() - 7 * 864e5));
  const prev7 = sales.filter(
    (r) =>
      new Date(r.saleDate) >= new Date(now.getTime() - 14 * 864e5) &&
      new Date(r.saleDate) < new Date(now.getTime() - 7 * 864e5)
  );

  const units30 = sum(sales, (r) => r.unitsSold);
  const revenue30 = sum(sales, (r) => Number(r.grossRevenue));
  const profit30 = sum(sales, (r) => Number(r.profit));
  const refunds30 = sum(sales, (r) => r.refunds);
  const units7 = sum(last7, (r) => r.unitsSold);
  const unitsPrev7 = sum(prev7, (r) => r.unitsSold);
  const avgDailyUnits = units30 / 30;

  // PPC (ACoS) across the product's campaigns.
  const campaigns = await PPCCampaign.findAll({ where: { productId: product.id } });
  let ppcSpend = 0;
  let ppcSales = 0;
  if (campaigns.length) {
    const perf = await PPCPerformance.findAll({
      where: {
        campaignId: { [Op.in]: campaigns.map((c) => c.id) },
        performanceDate: { [Op.gte]: iso(start30) },
      },
    });
    ppcSpend = sum(perf, (r) => Number(r.spend));
    ppcSales = sum(perf, (r) => Number(r.sales));
  }
  const acos = ppcService.calculateACoS(ppcSpend, ppcSales);

  // Ranking trend across tracked keywords.
  const keywords = await Keyword.findAll({ where: { productId: product.id, status: 'active' } });
  let rankSlopeSum = 0;
  let rankSamples = 0;
  for (const kw of keywords) {
    // eslint-disable-next-line no-await-in-loop
    const hist = await rankingService.getHistoricalRankings(kw.id, 30, 'amazon');
    const trend = rankingService.analyzeTrend(hist);
    if (trend.label !== 'insufficient-data') {
      rankSlopeSum += trend.slope;
      rankSamples += 1;
    }
  }
  const rankSlope = rankSamples ? rankSlopeSum / rankSamples : 0; // >0 = worsening

  // Price vs competitors.
  const competitorPrices = await priceOptimizer.getCompetitorPrices(product.id, 'amazon');
  const minCompetitor = competitorPrices.length
    ? Math.min(...competitorPrices.map((c) => c.price))
    : null;

  const stock = (product.fbaStock || 0) + (product.fbmStock || 0);
  const daysCover = avgDailyUnits > 0 ? stock / avgDailyUnits : null;

  return {
    units30,
    revenue30: Number(revenue30.toFixed(2)),
    profit30: Number(profit30.toFixed(2)),
    margin: revenue30 > 0 ? Number(((profit30 / revenue30) * 100).toFixed(1)) : 0,
    refunds30,
    refundRate: units30 > 0 ? Number(((refunds30 / units30) * 100).toFixed(1)) : 0,
    units7,
    unitsPrev7,
    salesTrendPct: unitsPrev7 > 0 ? Number((((units7 - unitsPrev7) / unitsPrev7) * 100).toFixed(1)) : null,
    avgDailyUnits: Number(avgDailyUnits.toFixed(2)),
    acos,
    ppcSpend: Number(ppcSpend.toFixed(2)),
    rankSlope: Number(rankSlope.toFixed(3)),
    keywordCount: keywords.length,
    price: Number(product.price),
    minCompetitor,
    priceGapPct:
      minCompetitor && Number(product.price) > 0
        ? Number((((Number(product.price) - minCompetitor) / minCompetitor) * 100).toFixed(1))
        : null,
    stock,
    daysCover: daysCover != null ? Number(daysCover.toFixed(1)) : null,
  };
}

function buildRecommendations(s) {
  const recs = [];
  const add = (severity, category, title, detail, action) =>
    recs.push({ severity, category, title, detail, action });

  // Inventory
  if (s.stock === 0 && s.avgDailyUnits > 0) {
    add('critical', 'inventory', 'Ausverkauft', 'Kein Lagerbestand — das killt Ranking & Umsatz sofort.', 'Dringend Nachschub einlagern.');
  } else if (s.daysCover != null && s.daysCover < 14) {
    add('warning', 'inventory', 'Lagerbestand niedrig', `Reichweite nur ~${s.daysCover} Tage bei aktuellem Absatz.`, 'Nachschub bestellen, bevor du out-of-stock gehst.');
  }

  // Sales trend + ranking
  if (s.salesTrendPct != null && s.salesTrendPct < -20 && s.rankSlope > 0.3) {
    add('warning', 'visibility', 'Umsatz & Ranking fallen', `Absatz -${Math.abs(s.salesTrendPct)}% (7 Tage) und Keyword-Ranking verschlechtert sich.`, 'Sichtbarkeit stärken: PPC auf Top-Keywords erhöhen + Listing-Keywords prüfen.');
  } else if (s.salesTrendPct != null && s.salesTrendPct < -20) {
    add('warning', 'sales', 'Absatz rückläufig', `Verkäufe -${Math.abs(s.salesTrendPct)}% gegenüber Vorwoche.`, 'Ursache prüfen: Preis, Verfügbarkeit, Wettbewerb, Saisonalität.');
  }

  // Price
  if (s.priceGapPct != null && s.priceGapPct > 5) {
    add('warning', 'price', 'Preis über Wettbewerb', `Dein Preis liegt ${s.priceGapPct}% über dem günstigsten Wettbewerber (${s.minCompetitor} €).`, 'Preis senken oder Mehrwert im Listing klarer herausstellen.');
  }

  // PPC
  if (s.acos > TARGET_ACOS * 1.2 && s.ppcSpend > 0) {
    add('warning', 'ppc', 'ACoS zu hoch', `ACoS ${s.acos}% liegt über dem Ziel (${TARGET_ACOS}%).`, 'Gebote auf schlechte Keywords senken/pausieren, Suchbegriffe bereinigen.');
  } else if (s.ppcSpend === 0 && s.units30 > 0) {
    add('info', 'ppc', 'Keine Werbung aktiv', 'Für dieses Produkt läuft keine PPC — du verschenkst Sichtbarkeit.', 'Eine Sponsored-Products-Kampagne mit Ziel-ACoS starten.');
  } else if (s.acos > 0 && s.acos < TARGET_ACOS * 0.6 && s.rankSlope >= 0) {
    add('info', 'ppc', 'Werbung unterausgelastet', `ACoS nur ${s.acos}% — hier ist Raum, aggressiver zu skalieren.`, 'PPC-Budget erhöhen, um mehr Umsatz & Ranking zu gewinnen.');
  }

  // Refunds → listing/quality expectation gap
  if (s.refundRate > 5) {
    add('warning', 'listing', 'Hohe Retourenquote', `${s.refundRate}% Erstattungen — oft ein Zeichen für falsche Erwartungen aus dem Listing.`, 'Bilder/Bullets/Beschreibung auf Genauigkeit prüfen; Reviews auf Kritik durchsehen.');
  }

  // Keyword coverage
  if (s.keywordCount < 5) {
    add('info', 'seo', 'Zu wenige Keywords getrackt', `Nur ${s.keywordCount} Keywords — die SEO-Basis ist dünn.`, 'Keyword-Recherche machen und relevante Begriffe ins Tracking + Listing aufnehmen.');
  }

  // Margin
  if (s.margin > 0 && s.margin < 10) {
    add('warning', 'profit', 'Marge sehr niedrig', `Nettomarge nur ${s.margin}%.`, 'Kostenstruktur (COGS, Gebühren, PPC) prüfen oder Preis anheben.');
  }

  if (recs.length === 0) {
    add('info', 'ok', 'Alles im grünen Bereich', 'Keine kritischen Signale gefunden — Produkt läuft solide.', 'Weiter beobachten und schrittweise skalieren.');
  }

  const order = { critical: 0, warning: 1, info: 2 };
  recs.sort((a, b) => order[a.severity] - order[b.severity]);
  return recs;
}

function healthScore(recs) {
  let score = 100;
  recs.forEach((r) => {
    if (r.category !== 'ok') score -= SEVERITY_WEIGHT[r.severity] || 0;
  });
  return Math.max(0, Math.min(100, score));
}

/** Primary bottleneck classification for a one-line headline. */
function primaryDiagnosis(s, recs) {
  const top = recs.find((r) => r.severity === 'critical') || recs.find((r) => r.severity === 'warning');
  if (!top) return { headline: 'Produkt läuft stabil', focus: 'ok' };
  const map = {
    inventory: 'Verfügbarkeit ist das Hauptproblem',
    price: 'Der Preis bremst den Verkauf',
    ppc: 'Die Werbung ist der Hebel',
    visibility: 'Sichtbarkeit/Ranking ist das Hauptproblem',
    sales: 'Nachfrage/Trend ist das Thema',
    listing: 'Das Listing ist das Hauptproblem',
    seo: 'SEO/Keywords sind die Baustelle',
    profit: 'Die Profitabilität ist das Thema',
  };
  return { headline: map[top.category] || top.title, focus: top.category };
}

async function analyzeProduct(productId, userId) {
  const product = await Product.findOne({ where: { id: productId, userId } });
  if (!product) return null;

  const signals = await gatherSignals(product);
  const recommendations = buildRecommendations(signals);
  const score = healthScore(recommendations);
  const diagnosis = primaryDiagnosis(signals, recommendations);

  return {
    product: {
      id: product.id,
      title: product.title,
      asin: product.asin,
      sku: product.sku,
    },
    healthScore: score,
    diagnosis,
    signals,
    recommendations,
  };
}

module.exports = { analyzeProduct, gatherSignals, buildRecommendations };
