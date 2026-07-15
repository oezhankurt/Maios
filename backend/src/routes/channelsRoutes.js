const express = require('express');
const channels = require('../config/channels');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Returns the full channel registry (marketplaces, search engines, ad platforms).
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      marketplaces: channels.marketplaces,
      searchEngines: channels.searchEngines,
      adPlatforms: channels.adPlatforms,
    },
  });
});

module.exports = router;
