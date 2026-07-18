import React, { useEffect, useRef } from 'react'
import './VoiceInput.css'

export default function VoiceInput({
  isListening,
  setIsListening,
  setTranscript,
  transcript,
  isLoading,
}) {
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported')
      return
    }

    recognitionRef.current = new SpeechRecognition()
    const recognition = recognitionRef.current

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'de-DE'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = e => {
      let interimTranscript = ''

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript

        if (e.results[i].isFinal) {
          setTranscript(prev => (prev ? prev + ' ' + transcript : transcript))
        } else {
          interimTranscript += transcript
        }
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = event => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [setIsListening, setTranscript])

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
    } else {
      setTranscript('')
      recognitionRef.current.start()
    }
  }

  return (
    <div className="voice-input-group">
      <button
        onClick={toggleListening}
        disabled={isLoading}
        className={`voice-button ${isListening ? 'listening' : ''}`}
        title={isListening ? 'Listening...' : 'Start listening'}
      >
        <div className={`voice-icon ${isListening ? 'active' : ''}`}>
          🎤
        </div>
      </button>

      {transcript && (
        <div className="transcript-display">
          <span className="transcript-label">Erkannt:</span>
          <span className="transcript-text">{transcript}</span>
        </div>
      )}

      {isListening && (
        <div className="listening-indicator">
          <div className="listening-dot"></div>
          <span>Höre zu...</span>
        </div>
      )}
    </div>
  )
}
