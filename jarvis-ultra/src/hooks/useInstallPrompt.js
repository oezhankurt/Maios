import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent)
    setIsIOS(isIOSDevice)

    // Check if app is already installed
    if (window.navigator.standalone === true) {
      setIsInstalled(true)
    }

    const handleBeforeInstallPrompt = e => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setInstalled(true)
      setInstallPrompt(null)
    }
  }

  return {
    installPrompt,
    isInstalled,
    isIOS,
    installApp,
    canInstall: !!installPrompt && !isInstalled,
  }
}
