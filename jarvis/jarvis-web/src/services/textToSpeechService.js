class TextToSpeechService {
  constructor() {
    const SpeechSynthesis = window.speechSynthesis
    const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance

    if (!SpeechSynthesis || !SpeechSynthesisUtterance) {
      console.error('Text-to-Speech API not available')
      this.available = false
      return
    }

    this.synth = SpeechSynthesis
    this.Utterance = SpeechSynthesisUtterance
    this.available = true
    this.isPlaying = false
    this.currentUtterance = null
    this.voices = []
    this.germanVoice = null
    this.audioContext = null
    this.analyser = null

    this.loadVoices()
    this.synth.onvoiceschanged = () => this.loadVoices()
    this.initAudioContext()
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      this.audioContext = new AudioContext()
    } catch (e) {
      console.warn('AudioContext not available for effects')
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices()
    this.germanVoice = this.voices.find(
      (voice) => voice.lang.includes('de') || voice.lang.includes('de-DE')
    )
  }

  speak(text, options = {}) {
    if (!this.available) {
      console.error('Text-to-Speech not available')
      return
    }

    if (this.isPlaying) {
      this.synth.cancel()
    }

    const utterance = new this.Utterance(text)
    utterance.lang = options.lang || 'de-DE'
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1

    if (this.germanVoice) {
      utterance.voice = this.germanVoice
    }

    utterance.onstart = () => {
      this.isPlaying = true
      options.onStart?.()
    }

    utterance.onend = () => {
      this.isPlaying = false
      options.onEnd?.()
    }

    utterance.onerror = (event) => {
      this.isPlaying = false
      console.error('Speech synthesis error:', event)
      options.onError?.(event)
    }

    utterance.onpause = () => {
      options.onPause?.()
    }

    utterance.onresume = () => {
      options.onResume?.()
    }

    this.currentUtterance = utterance
    this.synth.speak(utterance)
  }

  stop() {
    if (this.isPlaying) {
      this.synth.cancel()
      this.isPlaying = false
    }
  }

  pause() {
    if (this.isPlaying && this.synth.pause) {
      this.synth.pause()
    }
  }

  resume() {
    if (this.synth.resume) {
      this.synth.resume()
    }
  }

  isAvailable() {
    return this.available
  }

  getVoices() {
    return this.voices
  }

  getAvailableLanguages() {
    return [...new Set(this.voices.map((v) => v.lang))]
  }
}

export const textToSpeech = new TextToSpeechService()
