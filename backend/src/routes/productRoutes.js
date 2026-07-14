const express = require('express');
const { body } = require('express-validator');
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();
router.use(authenticate);

router.get('/', productController.list);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title required'),
    body('price').optional().isFloat({ min: 0 }),
    body('costPerUnit').optional().isFloat({ min: 0 }),
  ],
  validate,
  productController.create
);

router.get('/:id', productController.getOne);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);
router.get('/:id/stats', productController.stats);
router.get('/:id/price-recommendation', productController.priceRecommendation);
router.get('/:id/competitors', productController.competitors);
router.post('/:id/competitors', productController.addCompetitor);

module.exports = router;
