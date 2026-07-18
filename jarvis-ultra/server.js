import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()

app.use(cors())
app.use(bodyParser.json())

app.post('/api/claude', async (req, res) => {
  try {
    const { messages, model, max_tokens, system } = req.body
    const apiKey = req.headers['x-api-key']

    if (!apiKey) {
      return res.status(400).json({ error: { message: 'API Key erforderlich' } })
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
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    res.json(data)
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: { message: error.message } })
  }
})

const PORT = process.env.PORT || 5175
app.listen(PORT, () => {
  console.log(`🚀 J.A.R.V.I.S Proxy Server läuft auf http://localhost:${PORT}`)
})
