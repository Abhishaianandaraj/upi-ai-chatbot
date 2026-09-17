const knowledgeBase = [
  {
    topic: 'PAYMENT_FAILED',
    keywords: ['failed', 'failure', 'declined', 'unsuccessful'],
    information:
      'A failed UPI payment means the transaction was not completed successfully. The user should check the transaction status in their UPI app and verify whether the amount was debited. If the amount was debited despite the payment failing, they should check the transaction details and contact their bank if the issue is not resolved.',
  },

  {
    topic: 'PAYMENT_PENDING',
    keywords: ['pending', 'processing', 'waiting'],
    information:
      'A pending UPI transaction means the final transaction status has not yet been confirmed. The user should check the transaction status in their UPI app and avoid repeatedly making the same payment until the status is clear.',
  },

  {
    topic: 'REFUND',
    keywords: ['refund', 'refunded', 'money back', 'reversal'],
    information:
      'For a refund, the user should check the original transaction and refund status in their UPI app or with the merchant. Refund processing time can vary depending on the merchant, bank, and payment provider. Do not provide a specific timeline unless it is confirmed by an authoritative source.',
  },

  {
    topic: 'PAYMENT_NOT_RECEIVED',
    keywords: ['not received', 'did not receive', 'recipient', 'merchant did not receive'],
    information:
      'If the sender sees a successful UPI transaction but the recipient has not received the money, both parties should check the transaction status and transaction details. The sender should not make another payment immediately if the original transaction is still being investigated.',
  },

  {
    topic: 'UPI_PIN',
    keywords: ['pin', 'upi pin', 'change pin', 'forgot pin'],
    information:
      'A UPI PIN is confidential and must never be shared with anyone. Users should use the UPI app options provided by their bank or payment provider to change or reset their UPI PIN.',
  },

  {
    topic: 'SECURITY',
    keywords: ['scam', 'fraud', 'fraudulent', 'hacked', 'unauthorized', 'otp'],
    information:
      'Users should never share their UPI PIN, OTP, CVV, password, or banking credentials. If an unauthorized transaction is suspected, they should immediately contact their bank or UPI service provider through official channels.',
  },
]

module.exports = knowledgeBase