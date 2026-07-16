const listingExportService = require('../services/listingExportService');

exports.exportCSV = async (req, res) => {
  try {
    const { status } = req.query;

    const csv = await listingExportService.exportListingsToCSV(req.user.id, { status });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="listings.csv"');
    res.send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.exportJSON = async (req, res) => {
  try {
    const { status } = req.query;

    const json = await listingExportService.exportListingsToJSON(req.user.id, { status });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="listings.json"');
    res.send(JSON.stringify(json, null, 2));
  } catch (error) {
    console.error('JSON Export Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPDFReport = async (req, res) => {
  try {
    const report = await listingExportService.generatePDFReport(req.user.id);

    res.json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    console.error('PDF Report Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPerformanceReport = async (req, res) => {
  try {
    const report = await listingExportService.generatePerformanceReport(req.user.id);

    res.json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    console.error('Performance Report Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOptimizationReport = async (req, res) => {
  try {
    const report = await listingExportService.generateOptimizationReport(req.user.id);

    res.json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    console.error('Optimization Report Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
