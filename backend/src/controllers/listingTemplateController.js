const listingTemplateService = require('../services/listingTemplateService');

exports.createTemplate = async (req, res) => {
  try {
    const { name, category, description, platforms, tags, templateContent } = req.body;

    const template = await listingTemplateService.createTemplate(req.user.id, {
      name,
      category,
      description,
      platforms,
      tags,
      templateContent,
    });

    res.status(201).json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    console.error('Create Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await listingTemplateService.updateTemplate(templateId, req.user.id, req.body);

    res.json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    console.error('Update Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    const template = await listingTemplateService.getTemplate(templateId, req.user.id);

    res.json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    console.error('Get Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.listTemplates = async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;

    const result = await listingTemplateService.listUserTemplates(req.user.id, {
      category,
      limit,
      offset,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('List Templates Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    await listingTemplateService.deleteTemplate(templateId, req.user.id);

    res.json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error) {
    console.error('Delete Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createListingFromTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { overrides } = req.body;

    const listing = await listingTemplateService.createListingFromTemplate(
      req.user.id,
      templateId,
      overrides
    );

    res.status(201).json({
      success: true,
      data: {
        listing,
      },
    });
  } catch (error) {
    console.error('Create Listing From Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveListingAsTemplate = async (req, res) => {
  try {
    const { listingId } = req.params;
    const { templateName, platforms } = req.body;

    if (!templateName) {
      return res.status(400).json({ success: false, error: 'templateName required' });
    }

    const template = await listingTemplateService.saveListingAsTemplate(
      req.user.id,
      listingId,
      templateName,
      platforms
    );

    res.status(201).json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    console.error('Save Listing As Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await listingTemplateService.getTemplateCategories(req.user.id);

    res.json({
      success: true,
      data: {
        categories,
      },
    });
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.duplicateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { newName } = req.body;

    const template = await listingTemplateService.duplicateTemplate(templateId, req.user.id, newName);

    res.status(201).json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    console.error('Duplicate Template Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
