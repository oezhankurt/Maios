import './JarvisVoiceChat.css'
import { useSpeech } from '../hooks/useSpeech'
import { useClaude } from '../hooks/useClaude'
import { useMemory } from '../hooks/useMemory'
import Settings from './Settings'
import StandingOrders from './StandingOrders'
import { useState, useEffect, useRef } from 'react'

export default function JarvisVoiceChat() {
  const [messages, setMessages] = useState([])
  const [transcript, setTranscript] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [showStandingOrders, setShowStandingOrders] = useState(false)
  const messagesEndRef = useRef(null)
  const conversationId = useRef(`conv-${Date.now()}`)

  const { isListening, transcript: speechTranscript, isSpeaking, error: speechError, isSupported, startListening, stopListening, speak } = useSpeech()
  const { sendMessage, isLoading, error: claudeError, testConnection, setSystemPrompt, clearHistory } = useClaude()
  const { saveConversation, standingOrders } = useMemory()

  useEffect(() => {
    setTranscript(speechTranscript)
  }, [speechTranscript])

  const error = speechError || claudeError

  useEffect(() => {
    testConnection()
  }, [testConnection])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      saveConversation(conversationId.current, messages)
    }
  }, [messages, saveConversation])

  const handleSettingsSave = ({ apiKey, systemPrompt }) => {
    setSystemPrompt(systemPrompt)
    window.location.reload()
  }

  const handleClearHistory = () => {
    if (window.confirm('Chatverlauf wirklich löschen?')) {
      clearHistory()
      setMessages([])
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      setTranscript('')
      startListening()
    }
  }

  const handleSendMessage = async () => {
    if (!transcript.trim() || isLoading) return

    if (standingOrders.length > 0) {
      const ordersText = standingOrders.map(o => `- ${o.text}`).join('\n')
      const systemPromptWithOrders = `Du bist Jarvis, ein intelligenter Voice-Assistant für Claude.

Standing Orders (befolge diese immer):
${ordersText}

Antworte prägnant, hilfsbereit und auf Deutsch.
Halte deine Antworten kurz genug, um sie laut vorzulesen (2-3 Sätze ideal).`
      setSystemPrompt(systemPromptWithOrders)
    }

    const userMessage = { role: 'user', content: transcript }
    setMessages(prev => [...prev, userMessage])
    setTranscript('')

    try {
      const response = await sendMessage(transcript)
      const assistantMessage = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMessage])

      await new Promise(resolve => {
        speak(response, {
          onEnd: resolve,
        })
      })
    } catch (err) {
      console.error('Error:', err)
      speak('Entschuldigung, es gab ein Problem bei der Kommunikation mit Claude.')
    }
  }

  if (!isSupported) {
    return (
      <div className="jarvis-container">
        <div className="jarvis-header">
          <div className="jarvis-logo">❌</div>
          <h1>Jarvis</h1>
          <p>Speech-APIs nicht unterstützt</p>
        </div>
        <div className="chat-area">
          <div className="empty-state">
            <p>Dein Browser unterstützt Speech Recognition oder Text-to-Speech nicht. Versuche einen anderen Browser wie Chrome, Edge oder Safari.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="jarvis-container">
      <div className="jarvis-header">
        <div className="jarvis-logo">🎤</div>
        <div className="jarvis-title">
          <h1>Jarvis</h1>
          <p>Dein Voice Assistant für Claude</p>
        </div>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(true)}
          title="Einstellungen"
        >
          ⚙️
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-area">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <p>Drücke den Button oder sage "Hallo Jarvis"</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <span>{msg.content}</span>
            </div>
          ))}
        </div>

        {transcript && (
          <div className="transcript">
            <p>{transcript}</p>
          </div>
        )}

        {(isSpeaking || isLoading) && (
          <div className="speaking-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}

        {isLoading && (
          <div className="loading-message">
            Claude antwortet...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={toggleListening}
          disabled={isSpeaking || isLoading}
          title={isListening ? 'Stopp' : 'Recording starten'}
        >
          {isListening ? '🔴 Listening...' : '🎤 Speak'}
        </button>
        {transcript && (
          <button
            className={`send-button ${isLoading ? 'loading' : ''}`}
            onClick={handleSendMessage}
            disabled={isListening || isLoading}
          >
            {isLoading ? 'Claude antwortet...' : 'Senden ↩️'}
          </button>
        )}
        <div className="bottom-buttons">
          {messages.length > 0 && (
            <button className="clear-btn" onClick={handleClearHistory} title="Chatverlauf löschen">
              🗑️ Clear
            </button>
          )}
          <button
            className="orders-btn"
            onClick={() => setShowStandingOrders(true)}
            title="Standing Orders verwalten"
          >
            📋 {standingOrders.length}
          </button>
        </div>
      </div>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onSave={handleSettingsSave}
        />
      )}

      {showStandingOrders && (
        <StandingOrders
          onClose={() => setShowStandingOrders(false)}
        />
      )}
    </div>
  )
}
