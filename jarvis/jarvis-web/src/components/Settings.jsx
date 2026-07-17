import { useState } from 'react'
import './Settings.css'

export default function Settings({ onClose, onSave }) {
  const [apiKey, setApiKey] = useState(localStorage.getItem('VITE_CLAUDE_API_KEY') || '')
  const [systemPrompt, setSystemPrompt] = useState(
    localStorage.getItem('jarvis_system_prompt') || 'Du bist Jarvis, ein intelligenter Voice-Assistant für Claude.'
  )
  const [showApiKey, setShowApiKey] = useState(false)

  const handleSave = () => {
    localStorage.setItem('VITE_CLAUDE_API_KEY', apiKey)
    localStorage.setItem('jarvis_system_prompt', systemPrompt)
    onSave?.({ apiKey, systemPrompt })
    onClose()
  }

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <div className="settings-header">
          <h2>⚙️ Einstellungen</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="api-key">Claude API Key</label>
            <div className="api-key-input-group">
              <input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? 'Verstecken' : 'Zeigen'}
              >
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <small>Hole deinen Key von https://console.anthropic.com</small>
          </div>

          <div className="setting-group">
            <label htmlFor="system-prompt">System Prompt (Jarvis Persönlichkeit)</label>
            <textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={4}
              placeholder="Beschreibe wie Jarvis sein soll..."
            />
            <small>Dies bestimmt das Verhalten und den Ton von Jarvis</small>
          </div>
        </div>

        <div className="settings-footer">
          <button className="cancel-btn" onClick={onClose}>
            Abbrechen
          </button>
          <button className="save-btn" onClick={handleSave} disabled={!apiKey}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  )
}
