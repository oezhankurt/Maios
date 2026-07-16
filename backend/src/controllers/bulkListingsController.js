const csvImportService = require('../services/csvImportService');
const bulkListingsService = require('../services/bulkListingsService');

exports.importCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const records = csvImportService.parseCSV(fileContent);
    const { validRecords, errors } = csvImportService.validateCSVData(records);

    if (validRecords.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid records found in CSV',
        validationErrors: errors,
      });
    }

    const transformedRecords = csvImportService.transformRecords(validRecords);
    const result = await bulkListingsService.createListingsFromData(req.user.id, transformedRecords);

    res.json({
      success: true,
      imported: result.successful.length,
      failed: result.failed.length,
      total: result.total,
      validationErrors: errors.length > 0 ? errors : undefined,
      importResult: result,
    });
  } catch (error) {
    console.error('CSV Import Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCSVTemplate = (req, res) => {
  try {
    const template = csvImportService.getImportTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="listings-template.csv"');
    res.send(template);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.validateCSVData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const fileContent = req.file.buffer.toString('utf-8');
    const records = csvImportService.parseCSV(fileContent);
    const { validRecords, errors } = csvImportService.validateCSVData(records);

    res.json({
      success: true,
      validRecords: validRecords.length,
      invalidRecords: errors.length,
      total: records.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkOptimize = async (req, res) => {
  try {
    const { listingIds, platforms } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, error: 'listingIds array required' });
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'platforms array required' });
    }

    const result = await bulkListingsService.bulkOptimize(req.user.id, listingIds, platforms);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Bulk Optimize Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkPublish = async (req, res) => {
  try {
    const { listingIds, platforms } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, error: 'listingIds array required' });
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'platforms array required' });
    }

    const validation = await bulkListingsService.validateListingsForPublish(
      req.user.id,
      listingIds,
      platforms,
    );

    if (!validation.canPublish) {
      return res.status(400).json({
        success: false,
        error: 'Cannot publish some listings',
        validation,
      });
    }

    const result = await bulkListingsService.bulkPublish(req.user.id, listingIds, platforms);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Bulk Publish Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkDelete = async (req, res) => {
  try {
    const { listingIds } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, error: 'listingIds array required' });
    }

    const result = await bulkListingsService.bulkDelete(req.user.id, listingIds);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Bulk Delete Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { listingIds, status } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, error: 'listingIds array required' });
    }

    if (!status) {
      return res.status(400).json({ success: false, error: 'status field required' });
    }

    const result = await bulkListingsService.bulkUpdateStatus(req.user.id, listingIds, status);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Bulk Update Status Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.validateForPublish = async (req, res) => {
  try {
    const { listingIds, platforms } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      return res.status(400).json({ success: false, error: 'listingIds array required' });
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return res.status(400).json({ success: false, error: 'platforms array required' });
    }

    const result = await bulkListingsService.validateListingsForPublish(
      req.user.id,
      listingIds,
      platforms,
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Validation Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
