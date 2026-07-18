import React from 'react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import './InstallPrompt.css'

export default function InstallPrompt() {
  const { canInstall, isIOS, installApp } = useInstallPrompt()

  if (!canInstall && !isIOS) {
    return null
  }

  return (
    <div className="install-prompt">
      <div className="install-content">
        <span className="install-icon">📱</span>
        <span className="install-text">
          {isIOS ? 'Tippe zum Installieren: Share → Zum Home-Bildschirm' : 'JARVIS als App installieren'}
        </span>
        {canInstall && (
          <button className="install-button" onClick={installApp}>
            Installieren
          </button>
        )}
      </div>
    </div>
  )
}
