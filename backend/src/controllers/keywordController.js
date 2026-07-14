const { Keyword, Product } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const keywordService = require('../services/keywordService');

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

module.exports = { listForProduct, create, update, remove, research, suggestions };
