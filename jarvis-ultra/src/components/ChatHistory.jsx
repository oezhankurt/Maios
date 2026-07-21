import React from 'react'

export default function ChatHistory({ messages, messagesEndRef }) {
  return (
    <div className="chat-history">
      {messages.length === 0 ? (
        <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
          <div>J.A.R.V.I.S. bereit zu helfen</div>
          <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Sprechen Sie oder geben Sie eine Frage ein
          </div>
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div>
              <div className="message-role">
                {msg.role === 'user' ? 'SIE' : 'J.A.R.V.I.S'}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  )
}
