const { Op } = require('sequelize');
const { Product, DailySales, DailyProfit } = require('../models');

/** margin % = profit / revenue * 100 (0 when revenue is 0). */
function calculateMargin(revenue, costs) {
  const rev = Number(revenue) || 0;
  const cost = Number(costs) || 0;
  if (rev === 0) return 0;
  return Number((((rev - cost) / rev) * 100).toFixed(2));
}

/**
 * Given a raw sales snapshot for a product/day, compute the derived financial
 * fields and persist a DailySales row. Returns the computed record.
 */
async function calculateDailyProfit(productId, salesData) {
  const product = await Product.findByPk(productId);
  if (!product) throw new Error('Product not found');

  const {
    marketplace = 'amazon',
    saleDate,
    unitsSold = 0,
    price = product.price,
    grossRevenue,
    refunds = 0,
    refundedAmount = 0,
    referralFee = 0,
    fbaFee = 0,
    ppcSpend = 0,
  } = salesData;

  const gross = grossRevenue != null ? Number(grossRevenue) : Number(price) * unitsSold;
  const cogs = Number(product.costPerUnit) * unitsSold;
  // Refunds return money to the buyer, so they count as a cost against profit.
  const totalCosts =
    cogs + Number(referralFee) + Number(fbaFee) + Number(ppcSpend) + Number(refundedAmount);
  const netRevenue = gross - Number(referralFee) - Number(fbaFee) - Number(refundedAmount);
  const profit = gross - totalCosts;
  const profitMargin = calculateMargin(gross, totalCosts);
  const acos = gross > 0 ? Number(((Number(ppcSpend) / gross) * 100).toFixed(2)) : 0;

  const [record] = await DailySales.upsert(
    {
      productId,
      marketplace,
      saleDate,
      unitsSold,
      price,
      grossRevenue: gross,
      refunds,
      refundedAmount,
      referralFee,
      fbaFee,
      ppcSpend,
      netRevenue,
      profit,
      profitMargin,
      acos,
    },
    { returning: true }
  );

  await rollupDailyProfit(productId, saleDate);
  return record;
}

/**
 * Aggregates all marketplace DailySales rows for a product/day into a single
 * DailyProfit summary row.
 */
async function rollupDailyProfit(productId, date) {
  const rows = await DailySales.findAll({ where: { productId, saleDate: date } });
  const totals = rows.reduce(
    (acc, r) => {
      acc.revenue += Number(r.grossRevenue);
      acc.costs += Number(r.grossRevenue) - Number(r.profit);
      acc.profit += Number(r.profit);
      acc.units += r.unitsSold;
      acc.acosWeightedSpend += Number(r.ppcSpend);
      acc.acosRevenue += Number(r.grossRevenue);
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0, units: 0, acosWeightedSpend: 0, acosRevenue: 0 }
  );

  const avgAcos =
    totals.acosRevenue > 0
      ? Number(((totals.acosWeightedSpend / totals.acosRevenue) * 100).toFixed(2))
      : 0;

  await DailyProfit.upsert({
    productId,
    profitDate: date,
    totalRevenue: totals.revenue.toFixed(2),
    totalCosts: totals.costs.toFixed(2),
    totalProfit: totals.profit.toFixed(2),
    profitMargin: calculateMargin(totals.revenue, totals.costs),
    avgAcos,
    unitsSold: totals.units,
  });
}

/** Sum DailyProfit rows over a date range. */
async function analyzeMetrics(productId, { start, end }) {
  const rows = await DailyProfit.findAll({
    where: { productId, profitDate: { [Op.between]: [start, end] } },
    order: [['profitDate', 'ASC']],
  });

  const totals = rows.reduce(
    (acc, r) => {
      acc.revenue += Number(r.totalRevenue);
      acc.costs += Number(r.totalCosts);
      acc.profit += Number(r.totalProfit);
      acc.units += r.unitsSold;
      return acc;
    },
    { revenue: 0, costs: 0, profit: 0, units: 0 }
  );

  return {
    range: { start, end },
    totalRevenue: Number(totals.revenue.toFixed(2)),
    totalCosts: Number(totals.costs.toFixed(2)),
    totalProfit: Number(totals.profit.toFixed(2)),
    profitMargin: calculateMargin(totals.revenue, totals.costs),
    unitsSold: totals.units,
    series: rows,
  };
}

/**
 * Forecast the current month's profit by extrapolating the trailing-30-day
 * average daily profit across the days remaining in the month.
 */
async function forecastMonthlyProfit(productId) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);

  const metrics = await analyzeMetrics(productId, {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  });

  const daysObserved = metrics.series.length || 1;
  const avgDailyProfit = metrics.totalProfit / daysObserved;

  const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
  const dayOfMonth = end.getDate();

  // Actual month-to-date + projection for the rest of the month.
  const monthStart = new Date(end.getFullYear(), end.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const mtd = await analyzeMetrics(productId, {
    start: monthStart,
    end: end.toISOString().slice(0, 10),
  });

  const remainingDays = daysInMonth - dayOfMonth;
  const projectedRemaining = avgDailyProfit * remainingDays;

  return {
    monthToDateProfit: mtd.totalProfit,
    avgDailyProfit: Number(avgDailyProfit.toFixed(2)),
    projectedRemaining: Number(projectedRemaining.toFixed(2)),
    forecastMonthProfit: Number((mtd.totalProfit + projectedRemaining).toFixed(2)),
    daysInMonth,
    daysElapsed: dayOfMonth,
  };
}

/** Daily profit series for the trailing N days, zero-filled for missing days. */
async function getProfitChart(productId, days = 30) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  const where = { profitDate: { [Op.between]: [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] } };
  if (productId) where.productId = productId;

  const rows = await DailyProfit.findAll({ where, order: [['profitDate', 'ASC']] });

  // Aggregate by date across products when productId is not given.
  const byDate = new Map();
  rows.forEach((r) => {
    const key = r.profitDate;
    const acc = byDate.get(key) || { profit: 0, revenue: 0, units: 0 };
    acc.profit += Number(r.totalProfit);
    acc.revenue += Number(r.totalRevenue);
    acc.units += r.unitsSold;
    byDate.set(key, acc);
  });

  const series = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const acc = byDate.get(key) || { profit: 0, revenue: 0, units: 0 };
    series.push({
      date: key,
      profit: Number(acc.profit.toFixed(2)),
      revenue: Number(acc.revenue.toFixed(2)),
      units: acc.units,
    });
  }
  return series;
}

module.exports = {
  calculateMargin,
  calculateDailyProfit,
  rollupDailyProfit,
  analyzeMetrics,
  forecastMonthlyProfit,
  getProfitChart,
};
