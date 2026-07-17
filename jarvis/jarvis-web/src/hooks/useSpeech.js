import { useState, useCallback, useEffect } from 'react'
import { speechRecognition } from '../services/speechRecognitionService'
import { textToSpeech } from '../services/textToSpeechService'

export function useSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState(null)
  const [isSupported] = useState(() => speechRecognition.isAvailable() && textToSpeech.isAvailable())

  useEffect(() => {
    if (!speechRecognition.isAvailable()) return

    speechRecognition.on('start', () => {
      setIsListening(true)
      setError(null)
    })

    speechRecognition.on('result', (data) => {
      setTranscript(data.transcript)
    })

    speechRecognition.on('end', () => {
      setIsListening(false)
    })

    speechRecognition.on('error', (data) => {
      setError(data.message)
      setIsListening(false)
    })
  }, [])

  const startListening = useCallback(() => {
    if (speechRecognition.isAvailable()) {
      setTranscript('')
      speechRecognition.start()
    }
  }, [])

  const stopListening = useCallback(() => {
    if (speechRecognition.isAvailable()) {
      speechRecognition.stop()
    }
  }, [])

  const abortListening = useCallback(() => {
    if (speechRecognition.isAvailable()) {
      speechRecognition.abort()
      setIsListening(false)
    }
  }, [])

  const speak = useCallback((text, options = {}) => {
    if (textToSpeech.isAvailable()) {
      textToSpeech.speak(text, {
        ...options,
        onStart: () => {
          setIsSpeaking(true)
          options.onStart?.()
        },
        onEnd: () => {
          setIsSpeaking(false)
          options.onEnd?.()
        },
        onError: (error) => {
          setIsSpeaking(false)
          setError('Fehler beim Sprechen')
          options.onError?.(error)
        },
      })
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    textToSpeech.stop()
    setIsSpeaking(false)
  }, [])

  return {
    isListening,
    transcript,
    isSpeaking,
    error,
    isSupported,
    startListening,
    stopListening,
    abortListening,
    speak,
    stopSpeaking,
  }
}
