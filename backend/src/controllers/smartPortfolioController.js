const { SmartPortfolio, AutomationRule, PPCCampaign, Product } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const smartPortfolioService = require('../services/smartPortfolioService');

// ── Field / operator metadata for the Campaign-Mover rule builder UI ──────
const FIELD_META = [
  { value: 'campaignType', label: 'Kampagnentyp', type: 'enum', options: ['sp', 'sb', 'sd'] },
  { value: 'campaignStatus', label: 'Kampagnenstatus', type: 'enum', options: ['active', 'paused', 'archived'] },
  { value: 'campaignName', label: 'Kampagnenname', type: 'string' },
];
const METRIC_LABELS = {
  clicks: 'Klicks', conversions: 'Conversions', impressions: 'Impressionen',
  spend: 'Ausgaben', sales: 'Umsätze', acos: 'ACoS', roas: 'ROAS',
  cvr: 'CVR', ctr: 'CTR', cpo: 'CPO',
};
['30', '365'].forEach((win) => {
  smartPortfolioService.METRIC_FIELDS.forEach((m) => {
    FIELD_META.push({
      value: `${m}${win}`,
      label: `${METRIC_LABELS[m]} (${win === '30' ? '30 Tage' : '1 Jahr'})`,
      type: 'number',
    });
  });
});
const OPERATORS = {
  number: [
    { value: 'gt', label: '>' }, { value: 'lt', label: '<' },
    { value: 'gte', label: '≥' }, { value: 'lte', label: '≤' }, { value: 'eq', label: '=' },
  ],
  enum: [{ value: 'equals', label: 'ist' }],
  string: [
    { value: 'contains', label: 'enthält' }, { value: 'notContains', label: 'enthält nicht' },
    { value: 'startsWith', label: 'startet mit' }, { value: 'notStartsWith', label: 'startet nicht mit' },
    { value: 'endsWith', label: 'endet mit' }, { value: 'notEndsWith', label: 'endet nicht mit' },
  ],
};

async function ownedPortfolio(userId, id) {
  const p = await SmartPortfolio.findOne({ where: { id, userId } });
  if (!p) throw ApiError.notFound('Smart Portfolio not found');
  return p;
}
async function ownedRule(userId, id) {
  const r = await AutomationRule.findOne({ where: { id, userId } });
  if (!r) throw ApiError.notFound('Rule not found');
  return r;
}

// ── Smart Portfolios ──────────────────────────────────────────────────────
const listPortfolios = asyncHandler(async (req, res) => {
  const portfolios = await SmartPortfolio.findAll({
    where: { userId: req.user.id },
    include: [{ model: PPCCampaign, as: 'campaigns', attributes: ['id'] }],
    order: [['createdAt', 'DESC']],
  });
  const data = portfolios.map((p) => ({ ...p.toJSON(), campaignCount: p.campaigns.length, campaigns: undefined }));
  res.json({ success: true, data });
});

const createPortfolio = asyncHandler(async (req, res) => {
  const { name, targetAcos, dailyBudget, campaignTypes, staEnabled, pboEnabled, status } = req.body;
  if (!name) throw ApiError.badRequest('name is required');
  const portfolio = await SmartPortfolio.create({
    userId: req.user.id, name, targetAcos, dailyBudget, campaignTypes, staEnabled, pboEnabled, status,
  });
  res.status(201).json({ success: true, data: portfolio });
});

const updatePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await ownedPortfolio(req.user.id, req.params.id);
  const fields = ['name', 'targetAcos', 'dailyBudget', 'campaignTypes', 'staEnabled', 'pboEnabled', 'status'];
  const patch = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) patch[f] = req.body[f]; });
  await portfolio.update(patch);
  res.json({ success: true, data: portfolio });
});

const deletePortfolio = asyncHandler(async (req, res) => {
  const portfolio = await ownedPortfolio(req.user.id, req.params.id);
  await portfolio.destroy();
  res.json({ success: true, message: 'Portfolio deleted' });
});

const optimizePortfolios = asyncHandler(async (req, res) => {
  if (req.body.portfolioId) {
    await ownedPortfolio(req.user.id, req.body.portfolioId);
    const data = await smartPortfolioService.optimizePortfolio(req.body.portfolioId);
    return res.json({ success: true, data });
  }
  const data = await smartPortfolioService.optimizeAllPortfolios(req.user.id);
  return res.json({ success: true, data });
});

// ── Automation rules (Campaign Mover) ─────────────────────────────────────
const ruleFields = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { fields: FIELD_META, operators: OPERATORS } });
});

const listRules = asyncHandler(async (req, res) => {
  const rules = await AutomationRule.findAll({
    where: { userId: req.user.id },
    include: [{ model: SmartPortfolio, as: 'targetPortfolio', attributes: ['id', 'name'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ success: true, data: rules });
});

const createRule = asyncHandler(async (req, res) => {
  const { name, targetPortfolioId, logic, conditions, active } = req.body;
  if (!name || !targetPortfolioId) throw ApiError.badRequest('name and targetPortfolioId are required');
  await ownedPortfolio(req.user.id, targetPortfolioId); // ownership check
  const rule = await AutomationRule.create({
    userId: req.user.id, name, targetPortfolioId, logic, conditions, active,
  });
  res.status(201).json({ success: true, data: rule });
});

const updateRule = asyncHandler(async (req, res) => {
  const rule = await ownedRule(req.user.id, req.params.id);
  if (req.body.targetPortfolioId) await ownedPortfolio(req.user.id, req.body.targetPortfolioId);
  const fields = ['name', 'targetPortfolioId', 'logic', 'conditions', 'active'];
  const patch = {};
  fields.forEach((f) => { if (req.body[f] !== undefined) patch[f] = req.body[f]; });
  await rule.update(patch);
  res.json({ success: true, data: rule });
});

const deleteRule = asyncHandler(async (req, res) => {
  const rule = await ownedRule(req.user.id, req.params.id);
  await rule.destroy();
  res.json({ success: true, message: 'Rule deleted' });
});

const runRules = asyncHandler(async (req, res) => {
  const moves = await smartPortfolioService.applyRules(req.user.id);
  res.json({ success: true, data: { moves, count: moves.length } });
});

module.exports = {
  listPortfolios, createPortfolio, updatePortfolio, deletePortfolio, optimizePortfolios,
  ruleFields, listRules, createRule, updateRule, deleteRule, runRules,
};
