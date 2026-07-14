const { Op } = require('sequelize');
const { Product, DailyProfit, Alert } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const profitService = require('../services/profitService');

async function userProductIds(userId) {
  const rows = await Product.findAll({ where: { userId }, attributes: ['id'] });
  return rows.map((r) => r.id);
}

async function sumProfit(productIds, start, end) {
  if (productIds.length === 0) return { revenue: 0, profit: 0, units: 0 };
  const rows = await DailyProfit.findAll({
    where: { productId: { [Op.in]: productIds }, profitDate: { [Op.between]: [start, end] } },
  });
  return rows.reduce(
    (acc, r) => {
      acc.revenue += Number(r.totalRevenue);
      acc.profit += Number(r.totalProfit);
      acc.units += r.unitsSold;
      return acc;
    },
    { revenue: 0, profit: 0, units: 0 }
  );
}

const overview = asyncHandler(async (req, res) => {
  const ids = await userProductIds(req.user.id);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const yearStart = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);

  const [todayP, monthP, yearP] = await Promise.all([
    sumProfit(ids, today, today),
    sumProfit(ids, monthStart, today),
    sumProfit(ids, yearStart, today),
  ]);

  const activeProducts = await Product.count({
    where: { userId: req.user.id, status: 'active' },
  });
  const activeAlerts = await Alert.count({ where: { userId: req.user.id, status: 'active' } });

  res.json({
    success: true,
    data: {
      today: {
        revenue: Number(todayP.revenue.toFixed(2)),
        profit: Number(todayP.profit.toFixed(2)),
        units: todayP.units,
      },
      monthly: {
        revenue: Number(monthP.revenue.toFixed(2)),
        profit: Number(monthP.profit.toFixed(2)),
        units: monthP.units,
      },
      yearly: {
        revenue: Number(yearP.revenue.toFixed(2)),
        profit: Number(yearP.profit.toFixed(2)),
        units: yearP.units,
      },
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
