import { useOffline } from '../hooks/useOffline'
import './OfflineIndicator.css'

export default function OfflineIndicator() {
  const { isOnline, status } = useOffline()

  if (isOnline) {
    return null
  }

  return (
    <div className="offline-indicator">
      <span className="indicator-dot"></span>
      <span className="indicator-text">Offline-Modus • Nur lokale Funktionen</span>
    </div>
  )
}
