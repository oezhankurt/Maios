const { Keyword, Product, KeywordRanking } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const keywordService = require('../services/keywordService');
const rankingService = require('../services/rankingService');

async function assertOwnsProduct(userId, productId) {
  const product = await Product.findOne({ where: { id: productId, userId } });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

async function ownedKeyword(userId, keywordId) {
  const keyword = await Keyword.findByPk(keywordId, { include: [{ model: Product, as: 'product' }] });
  if (!keyword || !keyword.product || keyword.product.userId !== userId) {
    throw ApiError.notFound('Keyword not found');
  }
  return keyword;
}

const listForProduct = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const keywords = await Keyword.findAll({
    where: { productId: req.params.productId },
    order: [['searchVolume', 'DESC']],
  });
  res.json({ success: true, data: keywords });
});

const create = asyncHandler(async (req, res) => {
  const { productId, keyword, keywordType, searchVolume, cpc, difficultyScore } = req.body;
  await assertOwnsProduct(req.user.id, productId);

  // Enrich missing metrics from the research service.
  const enriched = keywordService.metricsFor(keyword);
  const row = await Keyword.create({
    productId,
    keyword,
    keywordType,
    searchVolume: searchVolume ?? enriched.searchVolume,
    cpc: cpc ?? enriched.cpc,
    difficultyScore: difficultyScore ?? enriched.difficultyScore,
  });
  res.status(201).json({ success: true, data: row });
});

const update = asyncHandler(async (req, res) => {
  const keyword = await ownedKeyword(req.user.id, req.params.id);
  const fields = ['keyword', 'keywordType', 'searchVolume', 'cpc', 'difficultyScore', 'status'];
  const patch = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) patch[f] = req.body[f];
  });
  await keyword.update(patch);
  res.json({ success: true, data: keyword });
});

const remove = asyncHandler(async (req, res) => {
  const keyword = await ownedKeyword(req.user.id, req.params.id);
  await keyword.destroy();
  res.json({ success: true, message: 'Keyword deleted' });
});

const research = asyncHandler(async (req, res) => {
  const { productTitle, category } = req.body;
  if (!productTitle) throw ApiError.badRequest('productTitle is required');
  const results = await keywordService.researchKeywords(productTitle, category);
  res.json({ success: true, data: results });
});

const suggestions = asyncHandler(async (req, res) => {
  const keyword = await ownedKeyword(req.user.id, req.params.id);
  const related = await keywordService.findRelatedKeywords(keyword.keyword);
  res.json({ success: true, data: related });
});

/**
 * Keyword Master view: every tracked keyword for a product, enriched with
 * difficulty tier, opportunity score, current rank and ranking trend.
 */
const master = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const marketplace = req.query.marketplace || 'amazon';
  const keywords = await Keyword.findAll({ where: { productId: req.params.productId } });

  const data = [];
  for (const kw of keywords) {
    // eslint-disable-next-line no-await-in-loop
    const latest = await KeywordRanking.findOne({
      where: { keywordId: kw.id, marketplace },
      order: [['rankDate', 'DESC']],
    });
    // eslint-disable-next-line no-await-in-loop
    const hist = await rankingService.getHistoricalRankings(kw.id, 30, marketplace);
    const trend = rankingService.analyzeTrend(hist);
    data.push({
      id: kw.id,
      keyword: kw.keyword,
      keywordType: kw.keywordType,
      searchVolume: kw.searchVolume,
      cpc: Number(kw.cpc),
      difficultyScore: kw.difficultyScore,
      difficultyTier: keywordService.difficultyTier(kw.difficultyScore),
      opportunity: keywordService.opportunity(kw.searchVolume, kw.difficultyScore),
      rank: latest ? latest.rankingPosition : null,
      trend: trend.label,
    });
  }
  data.sort((a, b) => b.opportunity - a.opportunity);
  res.json({ success: true, data });
});

/** Bulk-add keywords to a product (from the research/ideas panel). */
const bulkCreate = asyncHandler(async (req, res) => {
  const { productId, keywords } = req.body;
  if (!productId || !Array.isArray(keywords) || keywords.length === 0) {
    throw ApiError.badRequest('productId and a non-empty keywords array are required');
  }
  await assertOwnsProduct(req.user.id, productId);

  // Skip keywords already tracked for this product.
  const existing = new Set(
    (await Keyword.findAll({ where: { productId }, attributes: ['keyword'] })).map((k) =>
      k.keyword.toLowerCase()
    )
  );
  const rows = keywords
    .filter((k) => k.keyword && !existing.has(String(k.keyword).toLowerCase()))
    .map((k) => {
      const m = keywordService.metricsFor(k.keyword);
      return {
        productId,
        keyword: k.keyword,
        keywordType: k.keywordType || 'organic',
        searchVolume: k.searchVolume ?? m.searchVolume,
        cpc: k.cpc ?? m.cpc,
        difficultyScore: k.difficultyScore ?? m.difficultyScore,
      };
    });
  const created = rows.length ? await Keyword.bulkCreate(rows) : [];
  res.status(201).json({ success: true, data: { added: created.length } });
});

module.exports = { listForProduct, create, update, remove, research, suggestions, master, bulkCreate };
