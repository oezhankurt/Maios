const { User } = require('../models');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const amazonService = require('../services/amazonService');
const authService = require('../services/authService');

function publicUser(user) {
  const json = user.toJSON();
  delete json.passwordHash;
  delete json.amazonAccessToken;
  delete json.amazonRefreshToken;
  return json;
}

const register = asyncHandler(async (req, res) => {
  const { email, password, username, timezone, language, currency } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) throw ApiError.conflict('Email already registered');

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ email, passwordHash, username, timezone, language, currency });

  const token = signToken({ sub: user.id, email: user.email });
  res.status(201).json({ success: true, data: { user: publicUser(user), token } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.scope('withSecret').findOne({ where: { email } });
  if (!user) throw ApiError.unauthorized('Invalid credentials');

  const valid = await user.validatePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid credentials');

  if (user.status !== 'active') throw ApiError.forbidden('Account is inactive');

  await authService.logLoginEvent(user.id, req);

  const token = signToken({ sub: user.id, email: user.email });
  res.json({ success: true, data: { user: publicUser(user), token } });
});

// JWT is stateless; logout is a client-side token discard. Endpoint exists for
// symmetry and future token-blacklist support.
const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await authService.logLogoutEvent(req.user.id, req);
  }
  res.json({ success: true, message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: publicUser(req.user) });
});

const amazonConnect = asyncHandler(async (req, res) => {
  const { refreshToken, clientId, clientSecret, sellerId } = req.body;
  const result = await amazonService.connectAmazonAccount({
    refreshToken,
    clientId,
    clientSecret,
    sellerId,
  });

  await req.user.update({
    amazonSellerId: result.sellerId || req.user.amazonSellerId,
    amazonAccessToken: result.accessToken,
    amazonRefreshToken: result.refreshToken,
  });

  res.json({
    success: true,
    message: 'Amazon account connected',
    data: { sellerId: result.sellerId, expiresIn: result.expiresIn },
  });
});

const getLoginHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = parseInt(req.query.offset) || 0;

  const { count, rows } = await authService.getLoginHistory(req.user.id, limit, offset);

  res.json({
    success: true,
    data: { history: rows, total: count, limit, offset },
  });
});

module.exports = { register, login, logout, me, amazonConnect, getLoginHistory };
