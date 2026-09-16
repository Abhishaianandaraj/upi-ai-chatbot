const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { GoogleGenAI } = require('@google/genai')

const app = express()
const PORT = process.env.PORT || 5000

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    message: 'UPI Assist backend is running',
  })
})

app.post('/api/chat', async (req, res) => {
  const { message } = req.body

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: message,
      config: {
        systemInstruction:
          'You are UPI Assist, a helpful UPI customer support assistant. Answer questions about UPI payments, failed transactions, pending transactions, refunds, transaction limits, and common UPI issues. Never ask for OTPs, UPI PINs, passwords, CVVs, or other sensitive credentials. Keep responses clear, concise, and suitable for a customer support chatbot.',
      },
    })

    res.json({
      reply: response.text,
    })
  } catch (error) {
    console.error('Gemini API error:', error)

    res.status(500).json({
      reply: 'Sorry, I could not process your request right now.',
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})