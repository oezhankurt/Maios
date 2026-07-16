const { seeded } = require('./amazonService');

/**
 * Scribbles: AI-powered listing optimization tool.
 * Suggestions for title, bullets, description based on keywords and best practices.
 */

function generateSuggestions(field, keywords, currentText) {
  const r = seeded(`${field}|${keywords.join(',')}`);

  if (field === 'title') {
    const keywordSubset = keywords.slice(0, 3);
    return [
      `${keywordSubset[0]} - Premium ${keywordSubset[1]} für ${keywordSubset[2] || 'Gesundheit'}`,
      `${keywordSubset[0]} ${keywordSubset[1]} - ${keywordSubset[2] || 'Hochdosiert'} - ${r > 0.5 ? 'Bio' : 'Rein'}`,
      `${keywordSubset[0]} ${keywordSubset[1]} Kapseln - ${keywordSubset[2] || '180 Stück'} - Beste Qualität`,
    ];
  }

  if (field === 'bullets') {
    return [
      `${keywords[0]} mit ${keywords[1] || 'nachweisbarer'} Wirksamkeit`,
      `${keywords[2] || 'Hochdosiert'} Formel für ${r > 0.5 ? 'tägliche' : 'optimale'} Unterstützung`,
      `${keywords[3] || 'Vegetarische'} Kapseln, frei von ${r > 0.3 ? 'Zusatzstoffen' : 'Gentechnik'}`,
      `Laborgeprüft und zertifiziert für Qualität und Reinheit`,
      `${keywords[4] || 'Kostenlose'} Lieferung ${r > 0.6 ? 'innerhalb von 24h' : 'in DE'}`,
    ];
  }

  return [];
}

async function optimizeTitle(asin, keywords = []) {
  if (!keywords.length) {
    return { error: 'Keywords erforderlich' };
  }

  const suggestions = generateSuggestions('title', keywords, '');

  return {
    asin,
    field: 'Title',
    current: '',
    suggestions,
    guidelines: [
      'Max. 200 Zeichen',
      'Haupt-Keyword in den ersten 3 Wörtern',
      'Keine Wiederholungen oder CAPS',
      'Spezifische Attribute (Menge, Stärke, Form)',
    ],
  };
}

async function optimizeBullets(asin, keywords = []) {
  if (!keywords.length) {
    return { error: 'Keywords erforderlich' };
  }

  const suggestions = generateSuggestions('bullets', keywords, '');

  return {
    asin,
    field: 'Bullets',
    count: 5,
    suggestions,
    guidelines: [
      'Max. 5 Bullet Points',
      'Max. 150 Zeichen pro Bullet',
      'Fokus auf Vorteile, nicht nur Specs',
      'Keywords natürlich einbauen',
    ],
  };
}

async function optimizeDescription(asin, keywords = []) {
  const r = seeded(`desc|${asin}|${keywords.join(',')}`);

  return {
    asin,
    field: 'Beschreibung',
    suggestions: [
      'Erzählen Sie eine Geschichte über das Produkt',
      `Heben Sie die Alleinstellungsmerkmale hervor (${keywords[0] || 'Hauptvorteil'})`,
      'Integrieren Sie Kundenfeedback und Bewertungen',
      'Verwenden Sie Markdown-Formatierung für bessere Lesbarkeit',
      'Schließen Sie mit einem Call-to-Action ab',
    ],
    guidelines: [
      'Ideal: 200-500 Wörter',
      'Keywords sollten natürlich wirken',
      'Fokus auf Qualität über Keyword-Dichte',
      'Mobile-freundliche Struktur',
    ],
  };
}

async function analyzeContent(asin, field, text, keywords) {
  const r = seeded(`analyze|${field}|${text}`);

  const stats = {
    characters: text.length,
    words: text.split(/\s+/).length,
    keywordDensity: 0,
    readability: 'Gut',
    score: 0,
  };

  // Calculate keyword density
  if (keywords && keywords.length > 0) {
    const lowerText = text.toLowerCase();
    const foundKeywords = keywords.filter((kw) =>
      lowerText.includes(kw.toLowerCase())
    ).length;
    stats.keywordDensity = Math.round((foundKeywords / keywords.length) * 100);
  }

  // Readability score
  const avgWordLength = stats.characters / Math.max(1, stats.words);
  if (avgWordLength > 8) stats.readability = 'Komplex';
  else if (avgWordLength < 4) stats.readability = 'Sehr einfach';

  // Overall optimization score
  stats.score = Math.min(100, Math.round(
    (stats.keywordDensity * 0.3) +
    (stats.readability === 'Gut' ? 40 : stats.readability === 'Kompliziert' ? 20 : 35) +
    (stats.characters > 100 ? 20 : 0) +
    (stats.words > 20 ? 10 : 0)
  ));

  return {
    asin,
    field,
    stats,
    issues: stats.score < 50 ? [
      'Zu kurz oder zu lang',
      'Keywords nicht ausreichend abgedeckt',
      'Lesbarkeit könnte verbessert werden',
    ] : [],
  };
}

module.exports = {
  optimizeTitle,
  optimizeBullets,
  optimizeDescription,
  analyzeContent,
};
