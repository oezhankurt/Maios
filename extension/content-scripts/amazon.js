// Extract ASIN from Amazon product page
function getASIN() {
  // From URL
  const urlMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/);
  if (urlMatch) return urlMatch[1];

  // From page data
  const asinElement = document.querySelector('[data-asin]');
  if (asinElement) return asinElement.getAttribute('data-asin');

  // Fallback: look in page HTML
  const htmlMatch = document.documentElement.innerHTML.match(/"asin":"([A-Z0-9]{10})"/);
  if (htmlMatch) return htmlMatch[1];

  return null;
}

// Create and inject sidebar
function createSidebar() {
  const asin = getASIN();

  if (!asin) {
    console.log('Maios: ASIN not found on this page');
    return;
  }

  // Check if sidebar already exists
  if (document.getElementById('maios-sidebar')) {
    return;
  }

  const sidebar = document.createElement('div');
  sidebar.id = 'maios-sidebar';
  sidebar.innerHTML = `
    <div class="maios-sidebar-content">
      <div class="maios-header">
        <div class="maios-logo">Maios</div>
        <button id="maios-close" class="maios-close">&times;</button>
      </div>
      <div class="maios-loading">
        <div class="maios-spinner"></div>
        <p>Lade Produktdaten...</p>
      </div>
      <div id="maios-data" class="maios-data" style="display: none;"></div>
      <div id="maios-error" class="maios-error" style="display: none;"></div>
    </div>
  `;

  document.body.appendChild(sidebar);

  // Close button handler
  document.getElementById('maios-close').addEventListener('click', () => {
    sidebar.remove();
  });

  // Fetch product data
  chrome.runtime.sendMessage(
    { type: 'GET_PRODUCT_DATA', asin },
    handleProductData
  );
}

function handleProductData(response) {
  const dataContainer = document.getElementById('maios-data');
  const errorContainer = document.getElementById('maios-error');
  const loadingContainer = document.querySelector('.maios-loading');

  if (!response.success || response.data.error) {
    loadingContainer.style.display = 'none';
    errorContainer.style.display = 'block';
    errorContainer.innerHTML = `<p>${response.data.error || 'Fehler beim Laden der Daten'}</p>`;
    return;
  }

  loadingContainer.style.display = 'none';
  dataContainer.style.display = 'block';

  const { product, stats, competitors } = response.data;

  let html = `
    <div class="maios-section">
      <h3>${product.productName}</h3>
      <p class="maios-sku">SKU: ${product.sku || 'N/A'}</p>
    </div>

    <div class="maios-section">
      <h4>Preis & Verkauf</h4>
      <div class="maios-stat">
        <span class="label">Preis:</span>
        <span class="value">€${product.basePrice?.toFixed(2) || 'N/A'}</span>
      </div>
  `;

  if (stats) {
    html += `
      <div class="maios-stat">
        <span class="label">Tagesverkäufe:</span>
        <span class="value">${stats.dailySales || 'N/A'}</span>
      </div>
      <div class="maios-stat">
        <span class="label">Monatsverkäufe:</span>
        <span class="value">${stats.monthlySales || 'N/A'}</span>
      </div>
      <div class="maios-stat">
        <span class="label">Ranking:</span>
        <span class="value">#${stats.ranking || 'N/A'}</span>
      </div>
      <div class="maios-stat">
        <span class="label">BSR:</span>
        <span class="value">${stats.bsr || 'N/A'}</span>
      </div>
    `;
  }

  html += `</div>`;

  if (competitors && competitors.length > 0) {
    html += `
      <div class="maios-section">
        <h4>Wettbewerber (${competitors.length})</h4>
        <div class="maios-competitors">
    `;
    competitors.slice(0, 3).forEach(comp => {
      html += `
        <div class="maios-competitor">
          <p class="comp-name">${comp.sellerName || 'Unbekannt'}</p>
          <p class="comp-price">€${comp.price?.toFixed(2) || 'N/A'}</p>
        </div>
      `;
    });
    html += `
        </div>
      </div>
    `;
  }

  html += `
    <div class="maios-section maios-footer">
      <a href="https://maios-production.up.railway.app" target="_blank" class="maios-link">
        In Maios öffnen →
      </a>
    </div>
  `;

  dataContainer.innerHTML = html;
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSidebar);
} else {
  createSidebar();
}

// Re-initialize if URL changes (SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    createSidebar();
  }
}).observe(document, { subtree: true, childList: true });
