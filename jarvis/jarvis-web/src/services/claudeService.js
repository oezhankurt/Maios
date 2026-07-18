export class ClaudeService {
  constructor(apiKey = '') {
    this.apiKey = apiKey || import.meta.env.VITE_CLAUDE_API_KEY
    this.apiBase = 'https://api.anthropic.com'
    this.model = 'claude-opus-4-8'
    this.conversationHistory = []
    this.systemPrompt = this.getDefaultSystemPrompt()
  }

  getDefaultSystemPrompt() {
    return `Du bist Jarvis, ein intelligenter Voice-Assistant für Claude.
Du antwortest prägnant, hilfsbereit und auf Deutsch.
Halte deine Antworten kurz genug, um sie laut vorzulesen (2-3 Sätze ideal).
Sei freundlich, humorvoll und unterstützend.`
  }

  setSystemPrompt(prompt) {
    this.systemPrompt = prompt
  }

  addToHistory(role, content) {
    this.conversationHistory.push({ role, content })
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20)
    }
  }

  getHistory() {
    return this.conversationHistory
  }

  clearHistory() {
    this.conversationHistory = []
  }

  async sendMessage(userMessage) {
    if (!this.apiKey) {
      throw new Error('Claude API Key nicht konfiguriert. Bitte in Einstellungen hinzufügen.')
    }

    this.addToHistory('user', userMessage)

    const messages = this.conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    try {
      const response = await fetch('http://localhost:5175/api/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 1024,
          system: this.systemPrompt,
          messages,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.error?.message || `API Error: ${response.status}`
        )
      }

      const data = await response.json()
      const assistantMessage = data.content[0].text

      this.addToHistory('assistant', assistantMessage)

      return {
        content: assistantMessage,
        usage: {
          inputTokens: data.usage?.input_tokens || 0,
          outputTokens: data.usage?.output_tokens || 0,
        },
      }
    } catch (error) {
      console.error('Claude API Error:', error)
      if (!navigator.onLine) {
        throw new Error('Du bist offline. Claude API ist nicht erreichbar. Nur lokale Funktionen verfügbar.')
      }
      throw error
    }
  }

  async testConnection() {
    try {
      const response = await fetch(`${this.apiBase}/v1/models`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
      })

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`)
      }

      return { success: true, message: 'Claude API verbunden!' }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }
}

export const claudeService = new ClaudeService()
