import { useState, useRef, useEffect } from 'react'
import './JarvisVoiceChat.css'

export default function JarvisVoiceChat() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState([])
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.lang = 'de-DE'
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = true

    recognitionRef.current.onstart = () => setIsListening(true)
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.onerror = (e) => console.error('Speech error:', e)

    recognitionRef.current.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          setTranscript(prev => prev + transcriptPart)
        } else {
          interim += transcriptPart
        }
      }
      if (interim) setTranscript(prev => prev.split('\n')[0] + '\n' + interim)
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      setTranscript('')
      recognitionRef.current?.start()
    }
  }

  return (
    <div className="jarvis-container">
      <div className="jarvis-header">
        <div className="jarvis-logo">🎤</div>
        <h1>Jarvis</h1>
        <p>Dein Voice Assistant für Claude</p>
      </div>

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
      </div>

      <div className="controls">
        <button
          className={`voice-button ${isListening ? 'listening' : ''}`}
          onClick={toggleListening}
          title={isListening ? 'Stopp' : 'Recording starten'}
        >
          {isListening ? '🔴 Listening...' : '🎤 Speak'}
        </button>
      </div>
    </div>
  )
}
