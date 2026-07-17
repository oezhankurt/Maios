const express = require('express');
const RepricingService = require('../services/repricingService');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Get pricing stats (must come before /:id)
router.get('/stats/overview', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const stats = await RepricingService.getPricingStats(req.user.id, productId);
  res.json({ success: true, data: stats });
}));

// Get price history (must come before /:id)
router.get('/:productId/history', requireAuth, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const history = await RepricingService.getPriceHistory(
    req.params.productId,
    req.user.id,
    parseInt(days)
  );
  res.json({ success: true, data: history });
}));

// Create repricing rule
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const rule = await RepricingService.createRule(req.user.id, req.body);
  res.status(201).json({ success: true, data: rule });
}));

// Get all rules for user/product
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const rules = await RepricingService.listRules(req.user.id, productId);
  res.json({ success: true, data: rules });
}));

// Apply rule now (must come before /:id)
router.post('/:id/apply', requireAuth, asyncHandler(async (req, res) => {
  const result = await RepricingService.applyRule(req.params.id, req.user.id);
  res.json({ success: true, data: result });
}));

// Get specific rule
router.get('/:id', requireAuth, asyncHandler(async (req, res) => {
  const rule = await RepricingService.getRule(req.params.id, req.user.id);
  res.json({ success: true, data: rule });
}));

// Update rule
router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const rule = await RepricingService.updateRule(req.params.id, req.user.id, req.body);
  res.json({ success: true, data: rule });
}));

// Delete rule
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  await RepricingService.deleteRule(req.params.id, req.user.id);
  res.json({ success: true });
}));

module.exports = router;
