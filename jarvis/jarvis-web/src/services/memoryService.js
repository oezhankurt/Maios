const STORAGE_KEYS = {
  CONVERSATIONS: 'jarvis_conversations',
  STANDING_ORDERS: 'jarvis_standing_orders',
  USER_PROFILE: 'jarvis_user_profile',
  CHAT_HISTORY: 'jarvis_chat_history',
}

class MemoryService {
  constructor() {
    this.maxConversations = 10
    this.maxHistoryPerConversation = 50
  }

  saveConversation(conversationId, messages) {
    try {
      const conversations = this.getAllConversations()
      const timestamp = new Date().toISOString()

      conversations[conversationId] = {
        id: conversationId,
        messages: messages.slice(-this.maxHistoryPerConversation),
        timestamp,
        messageCount: messages.length,
      }

      const sorted = Object.values(conversations)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, this.maxConversations)

      const limited = {}
      sorted.forEach((conv) => {
        limited[conv.id] = conv
      })

      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(limited))
      return true
    } catch (error) {
      console.error('Error saving conversation:', error)
      return false
    }
  }

  getConversation(conversationId) {
    try {
      const conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '{}')
      return conversations[conversationId] || null
    } catch (error) {
      console.error('Error getting conversation:', error)
      return null
    }
  }

  getAllConversations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) || '{}')
    } catch (error) {
      console.error('Error getting all conversations:', error)
      return {}
    }
  }

  deleteConversation(conversationId) {
    try {
      const conversations = this.getAllConversations()
      delete conversations[conversationId]
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations))
      return true
    } catch (error) {
      console.error('Error deleting conversation:', error)
      return false
    }
  }

  clearAllConversations() {
    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS)
      return true
    } catch (error) {
      console.error('Error clearing conversations:', error)
      return false
    }
  }

  saveStandingOrders(orders) {
    try {
      localStorage.setItem(STORAGE_KEYS.STANDING_ORDERS, JSON.stringify(orders))
      return true
    } catch (error) {
      console.error('Error saving standing orders:', error)
      return false
    }
  }

  getStandingOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.STANDING_ORDERS) || '[]')
    } catch (error) {
      console.error('Error getting standing orders:', error)
      return []
    }
  }

  addStandingOrder(order) {
    try {
      const orders = this.getStandingOrders()
      orders.push({
        id: Date.now(),
        text: order,
        created: new Date().toISOString(),
      })
      this.saveStandingOrders(orders)
      return true
    } catch (error) {
      console.error('Error adding standing order:', error)
      return false
    }
  }

  removeStandingOrder(orderId) {
    try {
      const orders = this.getStandingOrders().filter((o) => o.id !== orderId)
      this.saveStandingOrders(orders)
      return true
    } catch (error) {
      console.error('Error removing standing order:', error)
      return false
    }
  }

  saveUserProfile(profile) {
    try {
      const userProfile = {
        ...this.getUserProfile(),
        ...profile,
        updated: new Date().toISOString(),
      }
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile))
      return true
    } catch (error) {
      console.error('Error saving user profile:', error)
      return false
    }
  }

  getUserProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_PROFILE) || '{}')
    } catch (error) {
      console.error('Error getting user profile:', error)
      return {}
    }
  }

  exportData() {
    try {
      return {
        conversations: this.getAllConversations(),
        standingOrders: this.getStandingOrders(),
        userProfile: this.getUserProfile(),
        exportedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error exporting data:', error)
      return null
    }
  }

  importData(data) {
    try {
      if (data.conversations) {
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data.conversations))
      }
      if (data.standingOrders) {
        localStorage.setItem(STORAGE_KEYS.STANDING_ORDERS, JSON.stringify(data.standingOrders))
      }
      if (data.userProfile) {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.userProfile))
      }
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  getStorageStats() {
    try {
      const conversations = this.getAllConversations()
      const standingOrders = this.getStandingOrders()
      const userProfile = this.getUserProfile()

      const estimateSize = (obj) => JSON.stringify(obj).length
      const totalSize = estimateSize(conversations) + estimateSize(standingOrders) + estimateSize(userProfile)

      return {
        conversationCount: Object.keys(conversations).length,
        messageCount: Object.values(conversations).reduce((sum, conv) => sum + (conv.messageCount || 0), 0),
        standingOrderCount: standingOrders.length,
        estimatedSizeKB: (totalSize / 1024).toFixed(2),
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
      return null
    }
  }
}

export const memoryService = new MemoryService()
