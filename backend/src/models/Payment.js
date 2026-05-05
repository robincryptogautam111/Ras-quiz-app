const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // What was purchased
  purchaseType: {
    type: String,
    enum: ['quiz', 'premium'],
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    default: null
  },
  // Pricing
  amount: { type: Number, required: true }, // in paise (₹1 = 100 paise)
  currency: { type: String, default: 'INR' },
  // Razorpay IDs
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  // Status
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  // Premium duration (months)
  premiumMonths: { type: Number, default: 0 },
  // Webhook verification
  webhookVerified: { type: Boolean, default: false },
  // Meta
  notes: { type: mongoose.Schema.Types.Mixed, default: {} },
  failureReason: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
