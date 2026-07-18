import React, { useState, useEffect, useRef } from 'react'
import { claudeService } from '../services/claudeService'
import VoiceInput from './VoiceInput'
import ChatHistory from './ChatHistory'
import './JarvisInterface.css'

export default function JarvisInterface() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!isListening && transcript.trim() && !isLoading && !isSpeaking) {
      handleSendMessage(transcript)
      setTranscript('')
    }
  }, [isListening])

  const handleSendMessage = async (text = inputText) => {
    if (!text.trim()) return

    setError('')
    setIsLoading(true)
    const userMessage = text.trim()
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setInputText('')

    try {
      const response = await claudeService.sendMessage(userMessage)
      setMessages(prev => [...prev, { role: 'assistant', content: response.content }])

      if (response.content) {
        speakResponse(response.content)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error:', err)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `Fehler: ${err.message}`,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const speakResponse = (text) => {
    if (!('speechSynthesis' in window)) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'de-DE'
    utterance.rate = 0.9
    utterance.onend = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  return (
    <div className="jarvis-interface">
      <div className="interface-header">
        <div className="header-text">J.A.R.V.I.S</div>
        <div className="header-status">
          <span className="status-light"></span>
          ONLINE
        </div>
      </div>

      <ChatHistory messages={messages} messagesEndRef={messagesEndRef} />

      {error && <div className="error-banner">{error}</div>}

      <div className="input-section">
        <VoiceInput
          isListening={isListening}
          setIsListening={setIsListening}
          setTranscript={setTranscript}
          transcript={transcript}
          isLoading={isLoading}
        />

        <div className="text-input-group">
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Fragen Sie mich etwas..."
            disabled={isLoading || isSpeaking}
            className="text-input"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || isSpeaking || !inputText.trim()}
            className="send-button"
          >
            {isLoading ? '⟳' : '→'}
          </button>
        </div>
      </div>

      <div className="interface-footer">
        <span>{isSpeaking ? '🔊 Spricht...' : '✓ Bereit'}</span>
      </div>
    </div>
  )
}
