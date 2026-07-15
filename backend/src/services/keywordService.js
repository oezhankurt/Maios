const amazonService = require('./amazonService');

/**
 * keywordService provides keyword research, difficulty scoring and related
 * keyword discovery. In demo mode metrics are derived deterministically from
 * the keyword string so results are stable and plausible.
 */

const MODIFIERS = [
  'best', 'cheap', 'premium', 'organic', 'professional', 'for kids', 'for men',
  'for women', 'set', 'bundle', 'refill', 'xl', 'natural', 'bulk', 'travel',
];

function difficultyTier(score) {
  if (score > 66) return 'hard';
  if (score > 33) return 'medium';
  return 'easy';
}

/**
 * Opportunity score 0-100: rewards high search volume and low difficulty —
 * the keywords worth prioritising (high demand, easier to rank).
 */
function opportunity(searchVolume, difficultyScore) {
  const volScore = Math.min(1, Math.log10(searchVolume + 1) / Math.log10(50000)); // 0..1
  const easeScore = 1 - Math.min(1, difficultyScore / 100); // 0..1 (easier = higher)
  return Math.round((volScore * 0.6 + easeScore * 0.4) * 100);
}

function enrich(row) {
  return {
    ...row,
    difficultyTier: difficultyTier(row.difficultyScore),
    opportunity: opportunity(row.searchVolume, row.difficultyScore),
  };
}

function metricsFor(keyword) {
  const r = amazonService.seeded(keyword.toLowerCase());
  const searchVolume = Math.round(200 + r * 40000);
  const cpc = Number((0.2 + r * 2.5).toFixed(2));
  // Broader / shorter terms are harder; longer tail terms easier.
  const words = keyword.trim().split(/\s+/).length;
  const difficultyScore = Math.max(
    1,
    Math.min(100, Math.round(90 - words * 12 + r * 30))
  );
  return { searchVolume, cpc, difficultyScore };
}

async function researchKeywords(productTitle, category = '') {
  const base = productTitle.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const words = base.split(/\s+/).filter(Boolean);
  const root = words.slice(0, 3).join(' ');

  const candidates = new Set();
  candidates.add(root);
  if (category) candidates.add(`${root} ${category.toLowerCase()}`);
  MODIFIERS.forEach((m) => {
    if (m.startsWith('for')) candidates.add(`${root} ${m}`);
    else candidates.add(`${m} ${root}`);
  });
  words.forEach((w) => candidates.add(w));

  return Array.from(candidates)
    .filter((k) => k.length > 2)
    .slice(0, 25)
    .map((keyword) => enrich({ keyword, keywordType: 'organic', ...metricsFor(keyword) }))
    .sort((a, b) => b.opportunity - a.opportunity);
}

function analyzeDifficulty(keyword) {
  const { difficultyScore, searchVolume, cpc } = metricsFor(keyword);
  let tier = 'easy';
  if (difficultyScore > 66) tier = 'hard';
  else if (difficultyScore > 33) tier = 'medium';
  return { keyword, difficultyScore, tier, searchVolume, cpc };
}

async function findRelatedKeywords(keyword) {
  const related = new Set();
  MODIFIERS.forEach((m) => {
    if (m.startsWith('for')) related.add(`${keyword} ${m}`);
    else related.add(`${m} ${keyword}`);
  });
  related.add(`${keyword} online`);
  related.add(`buy ${keyword}`);
  return Array.from(related)
    .slice(0, 15)
    .map((k) => enrich({ keyword: k, keywordType: 'organic', ...metricsFor(k) }))
    .sort((a, b) => b.opportunity - a.opportunity);
}

async function getSuggestions(productKeywords = []) {
  const suggestions = [];
  for (const kw of productKeywords) {
    // eslint-disable-next-line no-await-in-loop
    const related = await findRelatedKeywords(kw);
    suggestions.push(...related);
  }
  // De-duplicate by keyword and keep the highest-volume variant.
  const map = new Map();
  suggestions.forEach((s) => {
    if (!map.has(s.keyword) || map.get(s.keyword).searchVolume < s.searchVolume) {
      map.set(s.keyword, s);
    }
  });
  return Array.from(map.values()).sort((a, b) => b.searchVolume - a.searchVolume).slice(0, 30);
}

module.exports = {
  metricsFor,
  difficultyTier,
  opportunity,
  researchKeywords,
  analyzeDifficulty,
  findRelatedKeywords,
  getSuggestions,
};
