class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error('Speech Recognition API not available')
      this.recognition = null
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'de-DE'
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1

    this.isListening = false
    this.transcript = ''
    this.finalTranscript = ''
    this.callbacks = {
      onStart: null,
      onResult: null,
      onEnd: null,
      onError: null,
    }

    this.setupListeners()
  }

  setupListeners() {
    if (!this.recognition) return

    this.recognition.onstart = () => {
      this.isListening = true
      this.transcript = ''
      this.finalTranscript = ''
      this.callbacks.onStart?.()
    }

    this.recognition.onresult = (event) => {
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcriptPart = event.results[i][0].transcript

        if (event.results[i].isFinal) {
          this.finalTranscript += transcriptPart + ' '
        } else {
          interim += transcriptPart
        }
      }

      this.transcript = this.finalTranscript + interim

      this.callbacks.onResult?.({
        transcript: this.transcript,
        isFinal: event.results[event.results.length - 1]?.isFinal || false,
        finalTranscript: this.finalTranscript.trim(),
      })
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.callbacks.onEnd?.({
        transcript: this.finalTranscript.trim(),
      })
    }

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      this.callbacks.onError?.({
        error: event.error,
        message: this.getErrorMessage(event.error),
      })
    }
  }

  start() {
    if (!this.recognition) {
      console.error('Speech Recognition not available')
      return
    }
    if (!this.isListening) {
      this.recognition.start()
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  abort() {
    if (this.recognition) {
      this.recognition.abort()
    }
  }

  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback
    }
  }

  isAvailable() {
    return this.recognition !== null
  }

  getErrorMessage(error) {
    const messages = {
      'no-speech': 'Keine Sprache erkannt. Versuche es erneut.',
      'audio-capture': 'Kein Mikrofon gefunden.',
      'network': 'Netzwerkfehler. Überprüfe deine Verbindung.',
      'not-allowed': 'Mikrofon-Berechtigung verweigert.',
      'permission-denied': 'Mikrofon-Berechtigung verweigert.',
      'service-not-allowed': 'Speech Recognition Service nicht erlaubt.',
    }
    return messages[error] || `Fehler: ${error}`
  }
}

export const speechRecognition = new SpeechRecognitionService()
