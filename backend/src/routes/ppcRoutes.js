const express = require('express');
const { body } = require('express-validator');
const ppcController = require('../controllers/ppcController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validator');

const router = express.Router();
router.use(authenticate);

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
