const { seeded } = require('./amazonService');

/**
 * Audience: Consumer research platform.
 * Surveys, feedback collection, market insights.
 */

function generateSurveyData(surveyId, seed = surveyId) {
  const r = seeded(seed);

  const respondents = Math.floor(r * 500) + 50;
  const averageTime = Math.floor(r * 20) + 5; // minutes
  const completionRate = (0.7 + r * 0.3).toFixed(2);

  return {
    id: surveyId,
    title: 'Kundenzufriedenheitsumfrage',
    respondents,
    averageTime,
    completionRate,
    status: r > 0.3 ? 'Aktiv' : 'Abgeschlossen',
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      .toLocaleDateString('de-DE'),
  };
}

function generateQuestionData(question, respondents) {
  const r = seeded(question);

  // Different question types
  const types = [
    { type: 'multiple_choice', options: ['Ja', 'Nein', 'Weiß nicht'] },
    { type: 'rating_scale', options: ['1 - Nicht wichtig', '2', '3', '4', '5 - Sehr wichtig'] },
    { type: 'text', options: [] },
  ];

  const questionType = types[Math.floor(r * types.length)];
  const responses = {};

  if (questionType.options.length > 0) {
    questionType.options.forEach((opt) => {
      responses[opt] = Math.floor(r * (respondents * 0.5));
    });
  }

  return {
    question,
    type: questionType.type,
    responses,
    responseRate: (0.6 + r * 0.4).toFixed(2),
  };
}

async function createSurvey(title, description = '') {
  const surveyId = 'SURV-' + Date.now();
  return {
    id: surveyId,
    title,
    description,
    status: 'Entwurf',
    respondents: 0,
    createdAt: new Date().toLocaleDateString('de-DE'),
  };
}

async function getSurveys() {
  const surveys = [];
  const titles = [
    'Produktzufriedenheitsumfrage',
    'Marktsegmentierungsforschung',
    'Kundenmerkmalsanalyse',
    'Wettbewerbsbewertung',
    'Preiswahrnehmungsstudie',
  ];

  titles.forEach((title, idx) => {
    surveys.push(generateSurveyData(`SURV-${idx}`, title));
  });

  return surveys;
}

async function getSurvey(surveyId) {
  const survey = generateSurveyData(surveyId);

  const questions = [
    'Wie zufrieden sind Sie mit unserem Produkt?',
    'Würden Sie unser Produkt weiterempfehlen?',
    'Welche Farbe bevorzugen Sie?',
    'Welche Preisspanne ist akzeptabel?',
    'Was ist die wichtigste Funktion für Sie?',
  ];

  const questionData = questions.map((q) =>
    generateQuestionData(q, survey.respondents)
  );

  return {
    ...survey,
    questions: questionData,
    insights: {
      primaryAudience: 'Erwerbstätige 25-45 Jahre',
      purchaseFrequency: 'Monatlich',
      avgOrderValue: '€45-65',
      topCategories: ['Gesundheit', 'Wellness', 'Nahrungsergänzung'],
    },
  };
}

async function launchSurvey(surveyId, options = {}) {
  return {
    id: surveyId,
    status: 'Aktiv',
    respondents: 0,
    costPerResponse: options.costPerResponse || 0.50,
    targetRespondents: options.targetRespondents || 100,
    launchedAt: new Date().toLocaleDateString('de-DE'),
  };
}

async function generateInsights(surveyId) {
  const r = seeded(surveyId);

  return {
    surveyId,
    summary: 'Detaillierte Marktsegmentierungsanalyse',
    demographics: {
      ageGroups: {
        '18-24': Math.floor(r * 30),
        '25-34': Math.floor(r * 40),
        '35-44': Math.floor(r * 25),
        '45-54': Math.floor(r * 20),
        '55+': Math.floor(r * 15),
      },
      income: {
        '<€25k': Math.floor(r * 10),
        '€25k-50k': Math.floor(r * 20),
        '€50k-100k': Math.floor(r * 35),
        '€100k+': Math.floor(r * 35),
      },
      interests: [
        'Gesundheit & Wellness',
        'Fitness & Sport',
        'Bio-Produkte',
        'Nachhaltigkeit',
        'Premium-Qualität',
      ].slice(0, Math.floor(r * 5) + 2),
    },
    purchaseBehavior: {
      frequencyMonthly: Math.floor(r * 100),
      avgSpend: (40 + Math.floor(r * 60)).toString(),
      channels: [
        'Amazon DE',
        'DM Online',
        'Apotheken',
        'Bioläden',
      ].slice(0, Math.floor(r * 4) + 2),
    },
    keyFindings: [
      'Qualität und Natürlichkeit sind Kauftreiber #1',
      'Preis ist sekundär gegenüber Vertrauen in die Marke',
      'Kundenbewertungen beeinflussen 85% der Kaufentscheidungen',
      'Mobile Shopping wird bevorzugt',
    ],
  };
}

async function getMetadata() {
  return {
    activeSurveys: 2,
    totalRespondents: 1240,
    costPerResponse: 0.50,
    maxResponses: 10000,
    usedResponses: 1240,
  };
}

module.exports = {
  createSurvey,
  getSurveys,
  getSurvey,
  launchSurvey,
  generateInsights,
  getMetadata,
};
