import express from 'express';

const app = express();
app.use(express.json());

// CORS für alle Anfragen
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Claude API Proxy
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, model, max_tokens, system } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(400).json({ error: 'API Key erforderlich' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model || 'claude-opus-4-8',
        max_tokens: max_tokens || 1024,
        system: system || '',
        messages,
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5175, () => {
  console.log('🚀 Proxy Server läuft auf http://localhost:5175');
});
