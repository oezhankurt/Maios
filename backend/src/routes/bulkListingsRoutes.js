const express = require('express');
const multer = require('multer');
const { verifyToken } = require('../middleware/authMiddleware');
const bulkListingsController = require('../controllers/bulkListingsController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(verifyToken);

router.get('/csv-template', bulkListingsController.getCSVTemplate);
router.post('/csv-import', upload.single('file'), bulkListingsController.importCSV);
router.post('/csv-validate', upload.single('file'), bulkListingsController.validateCSVData);

router.post('/optimize', bulkListingsController.bulkOptimize);
router.post('/publish', bulkListingsController.bulkPublish);
router.post('/delete', bulkListingsController.bulkDelete);
router.post('/status', bulkListingsController.bulkUpdateStatus);
router.post('/validate-publish', bulkListingsController.validateForPublish);

module.exports = router;
