import { useState, useEffect } from 'react'
import { offlineService } from '../services/offlineService'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [connectionTested, setConnectionTested] = useState(false)

  useEffect(() => {
    const unsubscribe = offlineService.subscribe((status) => {
      setIsOnline(status === 'online')
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    const testConnection = async () => {
      const online = await offlineService.testConnectivity()
      setConnectionTested(true)
      setIsOnline(online)
    }

    const timer = setTimeout(testConnection, 1000)
    return () => clearTimeout(timer)
  }, [])

  return {
    isOnline,
    connectionTested,
    status: isOnline ? 'online' : 'offline',
    getStatus: () => offlineService.getStatus(),
  }
}
