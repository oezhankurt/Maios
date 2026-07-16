const audienceService = require('../services/audienceService');

async function createSurvey(req, res) {
  try {
    const { title, description } = req.body;
    const survey = await audienceService.createSurvey(title, description);
    res.status(201).json(survey);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getSurveys(req, res) {
  try {
    const surveys = await audienceService.getSurveys();
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getSurvey(req, res) {
  try {
    const { id } = req.params;
    const survey = await audienceService.getSurvey(id);
    res.json(survey);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function launchSurvey(req, res) {
  try {
    const { id } = req.params;
    const result = await audienceService.launchSurvey(id, req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function generateInsights(req, res) {
  try {
    const { id } = req.params;
    const insights = await audienceService.generateInsights(id);
    res.json(insights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMetadata(req, res) {
  try {
    const metadata = await audienceService.getMetadata();
    res.json(metadata);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createSurvey,
  getSurveys,
  getSurvey,
  launchSurvey,
  generateInsights,
  getMetadata,
};
