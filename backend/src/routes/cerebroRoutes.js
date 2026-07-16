const express = require('express');
const cerebroController = require('../controllers/cerebroController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.post('/search', cerebroController.search);
router.post('/analyze', cerebroController.analyze);

module.exports = router;
