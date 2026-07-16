const express = require('express');
const researchController = require('../controllers/researchController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/meta', researchController.meta);
router.post('/products', researchController.products);
router.post('/competitors', researchController.competitors);
router.post('/keywords', researchController.keywords);
router.post('/niche', researchController.niche);
router.post('/targeting', researchController.targeting);
router.post('/analytics', researchController.analytics);

module.exports = router;
