import { useState } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I'm UPI Assist. How can I help you today?",
    },
  ])

  const [input, setInput] = useState('')
  const quickActions = [
  'My payment failed',
  'My payment is pending',
  'I have not received my refund',
  'What are the UPI transaction limits?',
 ]

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input,
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
    ])

    setInput('')
  }

  return (
    <div className="app">
      <header className="chat-header">
        <div>
          <h1>UPI Assist</h1>
          <p>UPI Support Assistant</p>
        </div>
      </header>

      <main className="chat-container">
        <div className="quick-actions">
  <p>How can I help?</p>

      <div className="quick-action-buttons">
        {quickActions.map((action) => (
          <button
            key={action}
            onClick={() => {
              setInput(action)
            }}
          >
            {action}
          </button>
        ))}
      </div>
    </div>
        <div className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender}`}
            >
              <div className="message-bubble">
                {message.text}
              </div>
            </div>
          ))}
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Ask about your UPI transaction..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
          />

          <button onClick={handleSend}>
            Send
          </button>
        </div>
      </main>
    </div>
  )
}

export default App