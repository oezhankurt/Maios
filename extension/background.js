const API_BASE_URL = 'https://maios-production.up.railway.app/api';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PRODUCT_DATA') {
    const { asin, sku } = request;
    fetchProductData(asin || sku)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

async function fetchProductData(identifier) {
  try {
    const token = await chrome.storage.sync.get('maios_token');
    const authToken = token.maios_token;

    if (!authToken) {
      return { error: 'Not authenticated. Please log in to Maios first.' };
    }

    // Search for product by ASIN/SKU
    const response = await fetch(`${API_BASE_URL}/products?search=${identifier}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) {
      if (response.status === 401) {
        return { error: 'Session expired. Please log in again.' };
      }
      return { error: 'Failed to fetch product data' };
    }

    const result = await response.json();
    const product = result.data?.[0]; // Get first matching product

    if (!product) {
      return { error: 'Product not found in Maios database' };
    }

    // Get additional product data
    const [stats, competitors] = await Promise.all([
      fetchProductStats(product.id, authToken),
      fetchCompetitors(product.id, authToken)
    ]);

    return {
      product,
      stats,
      competitors,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching product data:', error);
    throw error;
  }
}

async function fetchProductStats(productId, authToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) return null;
    return (await response.json()).data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

async function fetchCompetitors(productId, authToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/competitors`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (!response.ok) return [];
    return (await response.json()).data || [];
  } catch (error) {
    console.error('Error fetching competitors:', error);
    return [];
  }
}

// Store auth token when user logs in
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'STORE_AUTH_TOKEN') {
    chrome.storage.sync.set({ 'maios_token': request.token });
  }
});
