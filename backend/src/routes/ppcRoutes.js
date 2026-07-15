const express = require('express');
const { body } = require('express-validator');
const ppcController = require('../controllers/ppcController');
const spController = require('../controllers/smartPortfolioController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();
router.use(authenticate);

// ── Smart Portfolios & Campaign-Mover automation ──
router.get('/portfolios', spController.listPortfolios);
router.post('/portfolios', spController.createPortfolio);
router.put('/portfolios/:id', spController.updatePortfolio);
router.delete('/portfolios/:id', spController.deletePortfolio);
router.post('/portfolios/optimize', spController.optimizePortfolios);

router.get('/rules/fields', spController.ruleFields);
router.get('/rules', spController.listRules);
router.post('/rules', spController.createRule);
router.put('/rules/:id', spController.updateRule);
router.delete('/rules/:id', spController.deleteRule);
router.post('/rules/run', spController.runRules);

router.get('/overview', ppcController.overview);
router.get('/campaigns', ppcController.list);
router.post(
  '/campaigns',
  [body('productId').notEmpty(), body('campaignName').notEmpty()],
  validate,
  ppcController.create
);
router.post('/optimize', ppcController.optimize);
router.get('/campaigns/:id', ppcController.getOne);
router.put('/campaigns/:id', ppcController.update);
router.get('/campaigns/:id/performance', ppcController.performance);

module.exports = router;
