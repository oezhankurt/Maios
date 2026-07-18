export class ClaudeService {
  constructor() {
    this.apiBase = 'http://localhost:5175'
    this.model = 'claude-opus-4-8'
    this.conversationHistory = []
    this.systemPrompt = this.getDefaultSystemPrompt()
  }

  getDefaultSystemPrompt() {
    return `Du bist J.A.R.V.I.S., ein intelligenter KI-Assistent im Stil von Iron Man's JARVIS.
Du bist höflich, hilfsbereit, prägnant und sprichst Deutsch.
Halte deine Antworten kurz genug, um sie laut vorzulesen (2-3 Sätze ideal).
Sei intelligent, humorvoll und unterstützend wie ein klassischer englischer Butler mit Zugang zu modernem Wissen.`
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
    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY

    if (!apiKey) {
      throw new Error(
        'Claude API Key nicht konfiguriert. Bitte VITE_CLAUDE_API_KEY in .env hinzufügen.'
      )
    }

    this.addToHistory('user', userMessage)

    const messages = this.conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    try {
      const response = await fetch(`${this.apiBase}/api/claude`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
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
        throw new Error(error.error?.message || `API Error: ${response.status}`)
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
        throw new Error('Du bist offline. Claude API ist nicht erreichbar.')
      }
      throw error
    }
  }
}

export const claudeService = new ClaudeService()
