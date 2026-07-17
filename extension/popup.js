document.getElementById('openDashboard').addEventListener('click', () => {
  chrome.tabs.create({
    url: 'https://maios-production.up.railway.app'
  });
});

document.getElementById('settings').addEventListener('click', () => {
  chrome.tabs.create({
    url: chrome.runtime.getURL('options.html')
  });
});

// Check auth status
chrome.storage.sync.get('maios_token', (result) => {
  const statusEl = document.getElementById('status');
  if (result.maios_token) {
    statusEl.className = 'status connected';
    statusEl.textContent = '✓ Authentifiziert';
  } else {
    statusEl.className = 'status disconnected';
    statusEl.textContent = '✗ Nicht angemeldet - bitte in Maios einloggen';
  }
});
