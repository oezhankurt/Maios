const express = require('express');
const { body } = require('express-validator');
const keywordController = require('../controllers/keywordController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();
router.use(authenticate);

router.get('/product/:productId', keywordController.listForProduct);

router.post(
  '/',
  [body('productId').notEmpty(), body('keyword').notEmpty()],
  validate,
  keywordController.create
);

router.post(
  '/research',
  [body('productTitle').notEmpty()],
  validate,
  keywordController.research
);

router.get('/:id/suggestions', keywordController.suggestions);
router.put('/:id', keywordController.update);
router.delete('/:id', keywordController.remove);

module.exports = router;
