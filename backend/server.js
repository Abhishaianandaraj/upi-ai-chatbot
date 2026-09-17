const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { GoogleGenAI } = require('@google/genai')
const knowledgeBase = require('./knowledgeBase')

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

async function detectIntent(messages) {
  const conversation = messages
    .map((message) => `${message.role}: ${message.content}`)
    .join('\n')

  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash-lite',
    contents: conversation,
    config: {
      systemInstruction: `
Classify the user's current UPI support issue into exactly one of these intents:

PAYMENT_FAILED
PAYMENT_PENDING
REFUND
UPI_LIMIT
UPI_PIN
SECURITY
PAYMENT_NOT_RECEIVED
GENERAL_UPI
OTHER

Use the entire conversation to determine the current issue.

Important:
- A short follow-up such as "it says successful", "still waiting", "it's been 48 hours", or "what about that?" must be interpreted using the previous messages.
- Do not classify a follow-up message in isolation.
- If the conversation clearly establishes an issue, keep the same intent unless the user changes the topic.

Return ONLY the intent name.
Do not explain your answer.
`,
    },
  })

  return response.text.trim()
}

function retrieveKnowledge(message, intent) {
  const text = message.toLowerCase()

  const scoredResults = knowledgeBase.map((item) => {
    let score = 0

    if (item.topic === intent) {
      score += 5
    }

    item.keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 1
      }
    })

    return {
      topic: item.topic,
      information: item.information,
      score,
    }
  })

  scoredResults.sort((a, b) => b.score - a.score)

  const topResults = scoredResults
    .filter((item) => item.score >= 2)
    .slice(0, 2)

  if (topResults.length === 0) {
    return null
  }

  return topResults.map((item) => ({
    topic: item.topic,
    information: item.information,
  }))
}

const intentGuidance = {
  PAYMENT_FAILED:
    'Help the user understand why a UPI payment may have failed and suggest practical next steps.',

  PAYMENT_PENDING:
    'Help the user understand a pending UPI transaction and explain what they can check before contacting their bank.',

  REFUND:
    'Help the user understand a delayed UPI or merchant refund. Do not invent a specific refund timeline.',

  UPI_LIMIT:
    'Answer questions about UPI transaction limits. If the exact limit depends on the bank or UPI app, clearly say so.',

  UPI_PIN:
    'Help with general UPI PIN issues. Never ask the user to provide their PIN.',

  SECURITY:
    'Prioritize account and payment safety. Never request OTPs, PINs, passwords, CVVs, or other sensitive information.',

  PAYMENT_NOT_RECEIVED:
    'Help when the sender sees a successful payment but the recipient has not received the money. Explain what the sender and recipient can check.',

  GENERAL_UPI:
    'Answer the general UPI question clearly and professionally.',

  OTHER:
    "Determine the user's actual question from the conversation and provide the most relevant UPI support.",
}

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      reply: 'Please enter a message.',
    })
  }

  try {
    // Step 1: Detect the user's intent
    const intent = await detectIntent(messages)

    // Step 2: Get guidance for the detected intent
    const guidance =
      intentGuidance[intent] || intentGuidance.OTHER

    // Step 3: Retrieve relevant knowledge
    const latestMessage = messages[messages.length - 1].content

    const knowledge = retrieveKnowledge(
      latestMessage,
      intent
    )

    console.log('Detected intent:', intent)
    console.log('Retrieved knowledge:', knowledge)

    // Step 4: Generate the final AI response
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',

      contents: messages.map((message) => ({
        role: message.role,
        parts: [
          {
            text: message.content,
          },
        ],
      })),

      config: {
        systemInstruction: `
You are UPI Assist, a professional and helpful UPI customer support assistant.

The user's detected intent is: ${intent}

Specific guidance for this intent:
${guidance}

Relevant UPI knowledge:
${
  knowledge
    ? knowledge
        .map(
          (item) => `${item.topic}: ${item.information}`
        )
        .join('\n')
    : 'No specific knowledge was found. Answer cautiously and do not invent facts.'
}

Use this intent to understand the user's issue and provide the most relevant response.

Communication style:
- Professional, polite, and approachable.
- Clear and concise, without sounding robotic.
- Use natural conversational language.
- Usually respond in 2-5 sentences unless more detail is genuinely needed.
- Avoid unnecessary headings, bullet points, and numbered lists for simple questions.
- Do not repeat the user's question.
- Ask one relevant follow-up question at a time when more information is needed.
- If the user has provided enough information, answer directly.
- Do not invent transaction timelines or unsupported UPI rules.

UPI safety:
- Never ask for a UPI PIN, OTP, CVV, password, or other sensitive credentials.
- Never claim to have access to the user's bank account or transaction details.
- If an issue requires bank-specific action, direct the user to their bank or UPI app.

Accuracy and safety rules:
- Use the provided UPI knowledge when it is relevant.
- Do not invent transaction timelines, limits, fees, policies, or banking rules.
- If a fact is not available in the provided knowledge, clearly say that it may depend on the user's bank, UPI app, merchant, or payment provider.
- Never claim to have access to the user's transaction, bank account, UPI account, or payment status.
- Never ask for OTP, UPI PIN, CVV, password, card details, or banking credentials.
- If the user reports fraud or an unauthorized transaction, advise them to contact their bank or payment provider through official channels.
- If the question is unrelated to UPI support, politely state that you can only assist with UPI-related questions.

Stay focused on UPI support.
`,
      },
    })

    res.json({
      reply: response.text,
      intent,
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