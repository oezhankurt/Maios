const { Op } = require('sequelize');
const { Product, DailySales, DailyProfit, Alert } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const profitService = require('../services/profitService');

async function userProductIds(userId) {
  const rows = await Product.findAll({ where: { userId }, attributes: ['id'] });
  return rows.map((r) => r.id);
}

const fmt = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

/** Aggregate DailySales for a product set over an inclusive date range. */
async function sumSales(productIds, start, end) {
  const empty = { revenue: 0, units: 0, refunds: 0, profit: 0 };
  if (productIds.length === 0) return empty;
  const rows = await DailySales.findAll({
    where: { productId: { [Op.in]: productIds }, saleDate: { [Op.between]: [start, end] } },
  });
  return rows.reduce(
    (acc, r) => {
      acc.revenue += Number(r.grossRevenue);
      acc.units += r.unitsSold;
      acc.refunds += r.refunds;
      acc.profit += Number(r.profit);
      return acc;
    },
    { ...empty }
  );
}

/** Percent change of current vs previous (0 when previous is 0). */
function deltaPct(cur, prev) {
  if (!prev) return null;
  return Number((((cur - prev) / Math.abs(prev)) * 100).toFixed(1));
}

/** Build a sellerboard-style tile: metrics + deltas vs a comparison period. */
function buildTile(cur, prev) {
  return {
    revenue: Number(cur.revenue.toFixed(2)),
    units: cur.units,
    refunds: cur.refunds,
    profit: Number(cur.profit.toFixed(2)),
    margin: cur.revenue > 0 ? Number(((cur.profit / cur.revenue) * 100).toFixed(1)) : 0,
    delta: {
      revenue: deltaPct(cur.revenue, prev.revenue),
      units: deltaPct(cur.units, prev.units),
      refunds: deltaPct(cur.refunds, prev.refunds),
      profit: deltaPct(cur.profit, prev.profit),
    },
  };
}

const overview = asyncHandler(async (req, res) => {
  const ids = await userProductIds(req.user.id);
  const now = new Date();

  const todayD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayD = addDays(todayD, -1);
  const dayBeforeD = addDays(todayD, -2);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthSameDayEnd = addDays(lastMonthStart, dayOfMonth - 1);
  const monthBeforeStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const monthBeforeEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [
    today, yesterday, dayBefore, monthMtd, lastMonthSameSpan, lastMonthFull, monthBeforeFull, yearAll,
  ] = await Promise.all([
    sumSales(ids, fmt(todayD), fmt(todayD)),
    sumSales(ids, fmt(yesterdayD), fmt(yesterdayD)),
    sumSales(ids, fmt(dayBeforeD), fmt(dayBeforeD)),
    sumSales(ids, fmt(monthStart), fmt(todayD)),
    sumSales(ids, fmt(lastMonthStart), fmt(lastMonthSameDayEnd)),
    sumSales(ids, fmt(lastMonthStart), fmt(lastMonthEnd)),
    sumSales(ids, fmt(monthBeforeStart), fmt(monthBeforeEnd)),
    sumSales(ids, fmt(yearStart), fmt(todayD)),
  ]);

  // Forecast: extrapolate month-to-date run rate across the full month.
  const scale = dayOfMonth > 0 ? daysInMonth / dayOfMonth : 1;
  const forecast = {
    revenue: Number((monthMtd.revenue * scale).toFixed(2)),
    units: Math.round(monthMtd.units * scale),
    refunds: Math.round(monthMtd.refunds * scale),
    profit: Number((monthMtd.profit * scale).toFixed(2)),
    margin: monthMtd.revenue > 0 ? Number(((monthMtd.profit / monthMtd.revenue) * 100).toFixed(1)) : 0,
    delta: { profit: deltaPct(monthMtd.profit * scale, lastMonthFull.profit) },
  };

  const activeProducts = await Product.count({ where: { userId: req.user.id, status: 'active' } });
  const activeAlerts = await Alert.count({ where: { userId: req.user.id, status: 'active' } });

  res.json({
    success: true,
    data: {
      tiles: {
        today: buildTile(today, yesterday),
        yesterday: buildTile(yesterday, dayBefore),
        thisMonth: buildTile(monthMtd, lastMonthSameSpan),
        forecast,
        lastMonth: buildTile(lastMonthFull, monthBeforeFull),
      },
      // Backward-compatible summary fields.
      today: buildTile(today, yesterday),
      monthly: buildTile(monthMtd, lastMonthSameSpan),
      yearly: buildTile(yearAll, { revenue: 0, units: 0, refunds: 0, profit: 0 }),
      activeProducts,
      activeAlerts,
    },
  });
});

const profitChart = asyncHandler(async (req, res) => {
  const ids = await userProductIds(req.user.id);
  const days = parseInt(req.query.days, 10) || 30;

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  const rows =
    ids.length === 0
      ? []
      : await DailyProfit.findAll({
          where: {
            productId: { [Op.in]: ids },
            profitDate: {
              [Op.between]: [start.toISOString().slice(0, 10), new Date().toISOString().slice(0, 10)],
            },
          },
        });

  const byDate = new Map();
  rows.forEach((r) => {
    const acc = byDate.get(r.profitDate) || { profit: 0, revenue: 0, units: 0 };
    acc.profit += Number(r.totalProfit);
    acc.revenue += Number(r.totalRevenue);
    acc.units += r.unitsSold;
    byDate.set(r.profitDate, acc);
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
  res.json({ success: true, data: series });
});

const topProducts = asyncHandler(async (req, res) => {
  const ids = await userProductIds(req.user.id);
  const limit = parseInt(req.query.limit, 10) || 5;

  const end = new Date().toISOString().slice(0, 10);
  const start = new Date();
  start.setDate(start.getDate() - 30);
  const startStr = start.toISOString().slice(0, 10);

  const results = [];
  for (const id of ids) {
    // eslint-disable-next-line no-await-in-loop
    const m = await profitService.analyzeMetrics(id, { start: startStr, end });
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findByPk(id);
    results.push({
      product,
      revenue: m.totalRevenue,
      profit: m.totalProfit,
      margin: m.profitMargin,
      unitsSold: m.unitsSold,
    });
  }

  results.sort((a, b) => b.profit - a.profit);
  res.json({ success: true, data: results.slice(0, limit) });
});

const alerts = asyncHandler(async (req, res) => {
  const status = req.query.status || 'active';
  const rows = await Alert.findAll({
    where: { userId: req.user.id, status },
    order: [['createdAt', 'DESC']],
    limit: parseInt(req.query.limit, 10) || 50,
  });
  res.json({ success: true, data: rows });
});

const dismissAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!alert) return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
  await alert.update({ status: 'dismissed' });
  return res.json({ success: true, data: alert });
});

module.exports = { overview, profitChart, topProducts, alerts, dismissAlert };
