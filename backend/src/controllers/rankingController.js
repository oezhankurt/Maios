const { Keyword, KeywordRanking, Product } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
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

const forProduct = asyncHandler(async (req, res) => {
  await assertOwnsProduct(req.user.id, req.params.productId);
  const marketplace = req.query.marketplace || 'amazon';

  // Latest ranking per keyword for the given marketplace.
  const keywords = await Keyword.findAll({ where: { productId: req.params.productId } });
  const data = [];
  for (const kw of keywords) {
    // eslint-disable-next-line no-await-in-loop
    const latest = await KeywordRanking.findOne({
      where: { keywordId: kw.id, marketplace },
      order: [['rankDate', 'DESC']],
    });
    data.push({
      keywordId: kw.id,
      keyword: kw.keyword,
      marketplace,
      rankingPosition: latest ? latest.rankingPosition : null,
      previousRanking: latest ? latest.previousRanking : null,
      change: latest
        ? rankingService.detectRankingChanges(latest.previousRanking, latest.rankingPosition)
        : { delta: 0, direction: 'new' },
    });
  }
  res.json({ success: true, data });
});

const history = asyncHandler(async (req, res) => {
  await ownedKeyword(req.user.id, req.params.keywordId);
  const days = parseInt(req.query.days, 10) || 30;
  const marketplace = req.query.marketplace || 'amazon';
  const rows = await rankingService.getHistoricalRankings(req.params.keywordId, days, marketplace);
  res.json({ success: true, data: rows });
});

const trend = asyncHandler(async (req, res) => {
  await ownedKeyword(req.user.id, req.params.keywordId);
  const days = parseInt(req.query.days, 10) || 30;
  const marketplace = req.query.marketplace || 'amazon';
  const rows = await rankingService.getHistoricalRankings(req.params.keywordId, days, marketplace);
  const analysis = rankingService.analyzeTrend(rows);
  res.json({ success: true, data: { ...analysis, points: rows } });
});

module.exports = { forProduct, history, trend };
