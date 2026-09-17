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
  const [isLoading, setIsLoading] = useState(false)

  const quickActions = [
    'My payment failed',
    'My payment is pending',
    'I have not received my refund',
    'What are the UPI transaction limits?',
  ]

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userText = input

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: userText,
    }

    const updatedMessages = [
      ...messages,
      userMessage,
    ]

    setMessages(updatedMessages)
    setInput('')

    try {
      setIsLoading(true)

      const response = await fetch(
        'https://upi-ai-chatbot.onrender.com/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: updatedMessages.map((message) => ({
              role:
                message.sender === 'user'
                  ? 'user'
                  : 'assistant',
              content: message.text,
            })),
          }),
        }
      )

      const data = await response.json()

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply,
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        botMessage,
      ])
    } catch (error) {
      console.error(
        'Error communicating with backend:',
        error
      )

      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'Sorry, I could not connect to the server.',
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        errorMessage,
      ])
    } finally {
      setIsLoading(false)
    }
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
                onClick={() => setInput(action)}
                disabled={isLoading}
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

          {isLoading && (
            <div className="message bot">
              <div className="message-bubble">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Ask about your UPI transaction..."
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
            disabled={isLoading}
          />

          <button
            onClick={handleSend}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default App