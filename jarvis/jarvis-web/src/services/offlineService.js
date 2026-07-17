class OfflineService {
  constructor() {
    this.isOnline = navigator.onLine
    this.listeners = []

    if ('serviceWorker' in navigator) {
      this.registerServiceWorker()
    }

    window.addEventListener('online', () => this.handleOnline())
    window.addEventListener('offline', () => this.handleOffline())
  }

  async registerServiceWorker() {
    try {
      await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered')
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  handleOnline() {
    this.isOnline = true
    this.notifyListeners('online')
  }

  handleOffline() {
    this.isOnline = false
    this.notifyListeners('offline')
  }

  subscribe(callback) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  notifyListeners(status) {
    this.listeners.forEach((cb) => cb(status))
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      status: this.isOnline ? 'online' : 'offline',
    }
  }

  async testConnectivity() {
    try {
      const response = await fetch('https://api.anthropic.com', {
        method: 'HEAD',
        mode: 'no-cors',
      })
      return true
    } catch {
      return false
    }
  }
}

export const offlineService = new OfflineService()
