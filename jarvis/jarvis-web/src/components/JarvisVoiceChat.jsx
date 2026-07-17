import './JarvisVoiceChat.css'
import { useSpeech } from '../hooks/useSpeech'
import { useState } from 'react'

export default function JarvisVoiceChat() {
  const [messages, setMessages] = useState([])
  const { isListening, transcript, isSpeaking, error, isSupported, startListening, stopListening, speak } = useSpeech()

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleSendMessage = () => {
    if (transcript.trim()) {
      const userMessage = { role: 'user', content: transcript }
      setMessages(prev => [...prev, userMessage])

      speak(`Du hast gesagt: ${transcript}. Das wird bald zu Claude weitergeleitet.`)
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
        <h1>Jarvis</h1>
        <p>Dein Voice Assistant für Claude</p>
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

        {isSpeaking && (
          <div className="speaking-indicator">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        )}
      </div>

      <div className="controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={toggleListening}
          disabled={isSpeaking}
          title={isListening ? 'Stopp' : 'Recording starten'}
        >
          {isListening ? '🔴 Listening...' : '🎤 Speak'}
        </button>
        {transcript && (
          <button className="send-button" onClick={handleSendMessage} disabled={isListening}>
            Senden ↩️
          </button>
        )}
      </div>
    </div>
  )
}
