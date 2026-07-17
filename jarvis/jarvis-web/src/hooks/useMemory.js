import { useState, useCallback, useEffect } from 'react'
import { memoryService } from '../services/memoryService'

export function useMemory() {
  const [conversations, setConversations] = useState([])
  const [standingOrders, setStandingOrders] = useState([])
  const [userProfile, setUserProfile] = useState({})
  const [stats, setStats] = useState(null)

  const loadConversations = useCallback(() => {
    const convs = Object.values(memoryService.getAllConversations()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    )
    setConversations(convs)
  }, [])

  const loadStandingOrders = useCallback(() => {
    setStandingOrders(memoryService.getStandingOrders())
  }, [])

  const loadUserProfile = useCallback(() => {
    setUserProfile(memoryService.getUserProfile())
  }, [])

  const loadStats = useCallback(() => {
    setStats(memoryService.getStorageStats())
  }, [])

  useEffect(() => {
    loadConversations()
    loadStandingOrders()
    loadUserProfile()
    loadStats()
  }, [loadConversations, loadStandingOrders, loadUserProfile, loadStats])

  const saveConversation = useCallback((conversationId, messages) => {
    const success = memoryService.saveConversation(conversationId, messages)
    if (success) {
      loadConversations()
      loadStats()
    }
    return success
  }, [loadConversations, loadStats])

  const deleteConversation = useCallback((conversationId) => {
    const success = memoryService.deleteConversation(conversationId)
    if (success) {
      loadConversations()
      loadStats()
    }
    return success
  }, [loadConversations, loadStats])

  const addStandingOrder = useCallback((order) => {
    const success = memoryService.addStandingOrder(order)
    if (success) {
      loadStandingOrders()
    }
    return success
  }, [loadStandingOrders])

  const removeStandingOrder = useCallback((orderId) => {
    const success = memoryService.removeStandingOrder(orderId)
    if (success) {
      loadStandingOrders()
    }
    return success
  }, [loadStandingOrders])

  const updateUserProfile = useCallback((profile) => {
    const success = memoryService.saveUserProfile(profile)
    if (success) {
      loadUserProfile()
    }
    return success
  }, [loadUserProfile])

  const exportData = useCallback(() => {
    return memoryService.exportData()
  }, [])

  const importData = useCallback((data) => {
    const success = memoryService.importData(data)
    if (success) {
      loadConversations()
      loadStandingOrders()
      loadUserProfile()
      loadStats()
    }
    return success
  }, [loadConversations, loadStandingOrders, loadUserProfile, loadStats])

  const clearAllMemory = useCallback(() => {
    const success = memoryService.clearAllConversations()
    if (success) {
      loadConversations()
      loadStats()
    }
    return success
  }, [loadConversations, loadStats])

  return {
    conversations,
    standingOrders,
    userProfile,
    stats,
    saveConversation,
    deleteConversation,
    addStandingOrder,
    removeStandingOrder,
    updateUserProfile,
    exportData,
    importData,
    clearAllMemory,
    reload: () => {
      loadConversations()
      loadStandingOrders()
      loadUserProfile()
      loadStats()
    },
  }
}
