import { useState, useCallback } from 'react'
import { claudeService } from '../services/claudeService'

export function useClaude() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [response, setResponse] = useState(null)
  const [history, setHistory] = useState([])

  const sendMessage = useCallback(async (message) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await claudeService.sendMessage(message)
      setResponse(result.content)
      setHistory(claudeService.getHistory())
      return result.content
    } catch (err) {
      const errorMessage = err.message || 'Fehler beim Senden der Nachricht'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const setSystemPrompt = useCallback((prompt) => {
    claudeService.setSystemPrompt(prompt)
  }, [])

  const clearHistory = useCallback(() => {
    claudeService.clearHistory()
    setHistory([])
  }, [])

  const testConnection = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await claudeService.testConnection()
      if (!result.success) {
        setError(result.message)
      }
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    sendMessage,
    setSystemPrompt,
    clearHistory,
    testConnection,
    isLoading,
    error,
    response,
    history,
  }
}
