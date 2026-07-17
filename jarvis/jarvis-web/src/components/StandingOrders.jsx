import { useState } from 'react'
import { useMemory } from '../hooks/useMemory'
import './StandingOrders.css'

export default function StandingOrders({ onClose }) {
  const { standingOrders, addStandingOrder, removeStandingOrder } = useMemory()
  const [newOrder, setNewOrder] = useState('')

  const handleAdd = () => {
    if (newOrder.trim()) {
      addStandingOrder(newOrder)
      setNewOrder('')
    }
  }

  return (
    <div className="standing-orders-overlay">
      <div className="standing-orders-modal">
        <div className="standing-orders-header">
          <h2>📋 Standing Orders</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="standing-orders-content">
          <p className="description">
            Definiere Regeln, die Jarvis immer befolgt:
          </p>

          <div className="add-order">
            <input
              type="text"
              value={newOrder}
              onChange={(e) => setNewOrder(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="z.B. 'Antworte immer auf Deutsch'"
            />
            <button onClick={handleAdd} disabled={!newOrder.trim()}>
              Hinzufügen
            </button>
          </div>

          <div className="orders-list">
            {standingOrders.length === 0 ? (
              <p className="empty">Noch keine Standing Orders definiert</p>
            ) : (
              standingOrders.map((order) => (
                <div key={order.id} className="order-item">
                  <span>{order.text}</span>
                  <button
                    className="delete-btn"
                    onClick={() => removeStandingOrder(order.id)}
                    title="Löschen"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="standing-orders-footer">
          <button className="close-modal-btn" onClick={onClose}>
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
