const { Product, Keyword } = require('../models');

/**
 * Listing-Score & Keyword-Gap analysis.
 *
 * Checks how well a product's tracked keywords are covered by its listing
 * content (title, bullets, description, backend search terms), weighted by
 * search volume, and surfaces the highest-value gaps — the keywords that
 * should be worked into the listing (especially the title).
 */

function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9äöüß\s]/gi, ' ');
}

// A keyword "covers" a field if every word of the keyword appears in it.
function coveredBy(keyword, fieldText) {
  const words = norm(keyword).split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;
  return words.every((w) => fieldText.includes(w));
}

async function analyzeListing(productId, userId) {
  const product = await Product.findOne({ where: { id: productId, userId } });
  if (!product) return null;

  const keywords = await Keyword.findAll({
    where: { productId, status: 'active' },
    order: [['searchVolume', 'DESC']],
  });

  const fields = {
    title: norm(product.title),
    bullets: norm((product.bullets || []).join(' ')),
    description: norm(product.description),
    backend: norm(product.backendKeywords),
  };
  const anyText = Object.values(fields).join(' ');

  let totalWeight = 0;
  let earnedWeight = 0;
  const covered = [];
  const gap = [];
  const titleGap = [];

  keywords.forEach((kw) => {
    const weight = Math.max(1, kw.searchVolume);
    totalWeight += weight;
    const inTitle = coveredBy(kw.keyword, fields.title);
    const inAny = coveredBy(kw.keyword, anyText);
    if (inTitle) earnedWeight += weight;
    else if (inAny) earnedWeight += weight * 0.6;

    const row = { keyword: kw.keyword, searchVolume: kw.searchVolume, inTitle };
    if (!inAny) gap.push(row);
    else covered.push(row);
    if (inAny && !inTitle && kw.searchVolume > 0) titleGap.push(row);
  });

  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

  const recommendations = [];
  if (gap.length) {
    const top = gap.slice(0, 5).map((g) => g.keyword).join(', ');
    recommendations.push({
      severity: gap.length > 3 ? 'warning' : 'info',
      title: `${gap.length} Keyword(s) fehlen komplett im Listing`,
      detail: `Nicht abgedeckt: ${top}${gap.length > 5 ? ' …' : ''}`,
      action: 'Diese Begriffe in Bullets/Beschreibung/Backend-Keywords einbauen.',
    });
  }
  if (titleGap.length) {
    const top = titleGap.slice(0, 3).map((g) => g.keyword).join(', ');
    recommendations.push({
      severity: 'warning',
      title: 'High-Volume-Keywords fehlen im Titel',
      detail: `Im Listing vorhanden, aber nicht im Titel: ${top}.`,
      action: 'Die wichtigsten Keywords in den Titel aufnehmen (höchstes Ranking-Gewicht).',
    });
  }
  if (!fields.bullets) recommendations.push({ severity: 'info', title: 'Bullet Points fehlen', detail: 'Keine Bullet Points hinterlegt.', action: 'Fünf keyword-reiche Bullet Points ergänzen.' });
  if (!fields.description) recommendations.push({ severity: 'info', title: 'Beschreibung fehlt', detail: 'Keine Produktbeschreibung hinterlegt.', action: 'Eine A+/Beschreibung mit Nebenkeywords ergänzen.' });
  if (!fields.backend) recommendations.push({ severity: 'info', title: 'Backend-Keywords leer', detail: 'Keine Backend-Suchbegriffe hinterlegt.', action: 'Synonyme & nicht sichtbare Begriffe in die Backend-Keywords (250 Bytes) eintragen.' });

  return {
    product: { id: product.id, title: product.title, asin: product.asin, sku: product.sku },
    score,
    totalKeywords: keywords.length,
    coveredCount: covered.length,
    gapCount: gap.length,
    gap: gap.slice(0, 15),
    titleGap: titleGap.slice(0, 10),
    fields: {
      hasBullets: Boolean(fields.bullets), hasDescription: Boolean(fields.description), hasBackend: Boolean(fields.backend),
    },
    recommendations,
  };
}

module.exports = { analyzeListing };
