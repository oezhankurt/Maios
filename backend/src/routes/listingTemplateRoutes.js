const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const listingTemplateController = require('../controllers/listingTemplateController');

const router = express.Router();

router.use(verifyToken);

router.post('/', listingTemplateController.createTemplate);
router.get('/', listingTemplateController.listTemplates);
router.get('/categories', listingTemplateController.getCategories);
router.get('/:templateId', listingTemplateController.getTemplate);
router.put('/:templateId', listingTemplateController.updateTemplate);
router.delete('/:templateId', listingTemplateController.deleteTemplate);
router.post('/:templateId/duplicate', listingTemplateController.duplicateTemplate);
router.post('/:templateId/create-listing', listingTemplateController.createListingFromTemplate);

router.post('/listings/:listingId/save-as-template', listingTemplateController.saveListingAsTemplate);

module.exports = router;
