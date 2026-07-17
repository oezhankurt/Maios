import axios from 'axios';
import { setCSRFHeader } from '../utils/csrf';

const baseURL = 'https://maios-production.up.railway.app/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
  withCredentials: true,
});

// Attach the JWT from localStorage to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maios_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Add CSRF token for state-changing requests
  setCSRFHeader(config);
  return config;
});

// Retry idempotent requests once on network/5xx errors, and surface a clean
// error message. A 401 clears the session and bounces to /login.
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;

    if (response && response.status === 401) {
      localStorage.removeItem('maios_token');
      localStorage.removeItem('maios_user');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }

    const isIdempotent = !config || ['get', 'head'].includes((config.method || 'get').toLowerCase());
    const retriable = !response || (response.status >= 500 && response.status < 600);
    if (config && isIdempotent && retriable && !config.__retried) {
      config.__retried = true;
      await new Promise((r) => setTimeout(r, 800));
      return api(config);
    }

    const message =
      response?.data?.error?.message || response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

// Unwrap the { success, data } envelope for convenience.
const unwrap = (p) => p.then((res) => res.data.data ?? res.data);

export const AuthAPI = {
  register: (payload) => unwrap(api.post('/auth/register', payload)),
  login: (payload) => unwrap(api.post('/auth/login', payload)),
  logout: () => unwrap(api.post('/auth/logout')),
  me: () => unwrap(api.get('/auth/me')),
  amazonConnect: (payload) => unwrap(api.post('/auth/amazon-connect', payload)),
  getLoginHistory: (params) => unwrap(api.get('/auth/login-history', { params })),
};

export const ProductAPI = {
  list: (params) => unwrap(api.get('/products', { params })),
  create: (payload) => unwrap(api.post('/products', payload)),
  get: (id) => unwrap(api.get(`/products/${id}`)),
  update: (id, payload) => unwrap(api.put(`/products/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/products/${id}`)),
  stats: (id) => unwrap(api.get(`/products/${id}/stats`)),
  analysis: (id) => unwrap(api.get(`/products/${id}/analysis`)),
  listingAnalysis: (id) => unwrap(api.get(`/products/${id}/listing-analysis`)),
  changes: (id) => unwrap(api.get(`/products/${id}/changes`)),
  priceRecommendation: (id, params) =>
    unwrap(api.get(`/products/${id}/price-recommendation`, { params })),
  competitors: (id) => unwrap(api.get(`/products/${id}/competitors`)),
  addCompetitor: (id, payload) => unwrap(api.post(`/products/${id}/competitors`, payload)),
};

export const KeywordAPI = {
  forProduct: (productId) => unwrap(api.get(`/keywords/product/${productId}`)),
  master: (productId, params) => unwrap(api.get(`/keywords/master/${productId}`, { params })),
  create: (payload) => unwrap(api.post('/keywords', payload)),
  bulkCreate: (payload) => unwrap(api.post('/keywords/bulk', payload)),
  update: (id, payload) => unwrap(api.put(`/keywords/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/keywords/${id}`)),
  research: (payload) => unwrap(api.post('/keywords/research', payload)),
  suggestions: (id) => unwrap(api.get(`/keywords/${id}/suggestions`)),
};

export const RankingAPI = {
  forProduct: (productId, params) => unwrap(api.get(`/rankings/product/${productId}`, { params })),
  history: (keywordId, params) => unwrap(api.get(`/rankings/${keywordId}/history`, { params })),
  trend: (keywordId, params) => unwrap(api.get(`/rankings/${keywordId}/trend`, { params })),
};

export const ProfitAPI = {
  daily: (productId) => unwrap(api.get(`/profit/daily/${productId}`)),
  monthly: (productId) => unwrap(api.get(`/profit/monthly/${productId}`)),
  yearly: (productId) => unwrap(api.get(`/profit/yearly/${productId}`)),
  forecast: (productId) => unwrap(api.get(`/profit/forecast/${productId}`)),
  chart: (params) => unwrap(api.get('/profit/chart', { params })),
};

export const PPCAPI = {
  overview: (params) => unwrap(api.get('/ppc/overview', { params })),
  campaigns: (params) => unwrap(api.get('/ppc/campaigns', { params })),
  create: (payload) => unwrap(api.post('/ppc/campaigns', payload)),
  get: (id) => unwrap(api.get(`/ppc/campaigns/${id}`)),
  update: (id, payload) => unwrap(api.put(`/ppc/campaigns/${id}`, payload)),
  performance: (id, params) => unwrap(api.get(`/ppc/campaigns/${id}/performance`, { params })),
  optimize: (payload) => unwrap(api.post('/ppc/optimize', payload)),

  // Smart Portfolios (Adference-style)
  portfolios: () => unwrap(api.get('/ppc/portfolios')),
  createPortfolio: (payload) => unwrap(api.post('/ppc/portfolios', payload)),
  updatePortfolio: (id, payload) => unwrap(api.put(`/ppc/portfolios/${id}`, payload)),
  deletePortfolio: (id) => unwrap(api.delete(`/ppc/portfolios/${id}`)),
  optimizePortfolios: (payload) => unwrap(api.post('/ppc/portfolios/optimize', payload || {})),

  // Campaign-Mover rules
  ruleFields: () => unwrap(api.get('/ppc/rules/fields')),
  rules: () => unwrap(api.get('/ppc/rules')),
  createRule: (payload) => unwrap(api.post('/ppc/rules', payload)),
  updateRule: (id, payload) => unwrap(api.put(`/ppc/rules/${id}`, payload)),
  deleteRule: (id) => unwrap(api.delete(`/ppc/rules/${id}`)),
  runRules: () => unwrap(api.post('/ppc/rules/run')),
};

export const ChannelAPI = {
  list: () => unwrap(api.get('/channels')),
};

// Black Box — product & keyword market research
export const ResearchAPI = {
  meta: () => unwrap(api.get('/research/meta')),
  products: (filters) => unwrap(api.post('/research/products', filters || {})),
  competitors: (payload) => unwrap(api.post('/research/competitors', payload || {})),
  keywords: (filters) => unwrap(api.post('/research/keywords', filters || {})),
  niche: (payload) => unwrap(api.post('/research/niche', payload || {})),
  targeting: (payload) => unwrap(api.post('/research/targeting', payload || {})),
  analytics: (payload) => unwrap(api.post('/research/analytics', payload || {})),
};

// Cerebro — reverse-ASIN & keyword expansion
export const CerebroAPI = {
  search: (payload) => unwrap(api.post('/cerebro/search', payload || {})),
  analyze: (payload) => unwrap(api.post('/cerebro/analyze', payload || {})),
};

// Listing Builder — product listing management
export const ListingBuilderAPI = {
  meta: () => unwrap(api.get('/listings/builder/meta')),
  list: (params) => unwrap(api.get('/listings/builder', { params })),
  get: (id) => unwrap(api.get(`/listings/builder/${id}`)),
  create: (payload) => unwrap(api.post('/listings/builder', payload)),
  update: (id, payload) => unwrap(api.put(`/listings/builder/${id}`, payload)),
  delete: (id) => unwrap(api.delete(`/listings/builder/${id}`)),
};

// Listing Analyzer — competitor analysis
export const ListingAnalyzerAPI = {
  analyzeMain: (payload) => unwrap(api.post('/listings/analyzer/main', payload)),
  addCompetitors: (payload) => unwrap(api.post('/listings/analyzer/competitors', payload)),
};

// Index Checker — keyword ranking
export const IndexCheckerAPI = {
  check: (payload) => unwrap(api.post('/listings/index/check', payload)),
  batch: (payload) => unwrap(api.post('/listings/index/batch', payload)),
  track: (payload) => unwrap(api.post('/listings/index/track', payload)),
};

// Scribbles — listing optimization
export const ScribbleAPI = {
  optimizeTitle: (payload) => unwrap(api.post('/listings/scribbles/title', payload)),
  optimizeBullets: (payload) => unwrap(api.post('/listings/scribbles/bullets', payload)),
  optimizeDescription: (payload) => unwrap(api.post('/listings/scribbles/description', payload)),
  analyzeContent: (payload) => unwrap(api.post('/listings/scribbles/analyze', payload)),
};

// Audience — consumer research
export const AudienceAPI = {
  meta: () => unwrap(api.get('/audience/meta')),
  list: () => unwrap(api.get('/audience')),
  get: (id) => unwrap(api.get(`/audience/${id}`)),
  create: (payload) => unwrap(api.post('/audience', payload)),
  launch: (id, payload) => unwrap(api.post(`/audience/${id}/launch`, payload)),
  insights: (id) => unwrap(api.get(`/audience/${id}/insights`)),
};

// Google Ads — campaign & keyword management
export const GoogleAdsAPI = {
  getCampaigns: (params) => unwrap(api.get('/google-ads/campaigns', { params })),
  getCampaign: (id) => unwrap(api.get(`/google-ads/campaigns/${id}`)),
  getKeywords: (campaignId) => unwrap(api.get('/google-ads/keywords', { params: { campaignId } })),
  optimizeKeywords: (payload) => unwrap(api.post('/google-ads/keywords/optimize', payload)),
  getBudgetAllocation: () => unwrap(api.get('/google-ads/budget')),
  getPerformance: (campaignId, dateRange) =>
    unwrap(api.get('/google-ads/performance', { params: { campaignId, dateRange } })),
};

// Bing Ads — campaign management
export const BingAdsAPI = {
  getCampaigns: (params) => unwrap(api.get('/bing-ads/campaigns', { params })),
  getCampaign: (id) => unwrap(api.get(`/bing-ads/campaigns/${id}`)),
  getKeywords: (campaignId) => unwrap(api.get('/bing-ads/keywords', { params: { campaignId } })),
  getPerformance: (campaignId, dateRange) =>
    unwrap(api.get('/bing-ads/performance', { params: { campaignId, dateRange } })),
  suggestOptimizations: (payload) => unwrap(api.post('/bing-ads/optimize', payload)),
};

export const DashboardAPI = {
  overview: () => unwrap(api.get('/dashboard/overview')),
  profitChart: (params) => unwrap(api.get('/dashboard/profit-chart', { params })),
  topProducts: (params) => unwrap(api.get('/dashboard/top-products', { params })),
  alerts: (params) => unwrap(api.get('/dashboard/alerts', { params })),
  dismissAlert: (id) => unwrap(api.patch(`/dashboard/alerts/${id}/dismiss`)),
};

export default api;
