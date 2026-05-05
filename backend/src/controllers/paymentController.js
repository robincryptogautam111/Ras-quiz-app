const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// POST /api/payment/create-order
const createOrder = async (req, res) => {
  const { purchaseType, quizId, premiumMonths } = req.body;

  let amount, notes = {};

  if (purchaseType === 'quiz') {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    if (quiz.type !== 'paid') return res.status(400).json({ success: false, message: 'This quiz is free.' });

    // Check already purchased
    if (req.user.purchasedQuizzes.includes(quizId)) {
      return res.status(400).json({ success: false, message: 'Quiz already purchased.' });
    }

    amount = quiz.price * 100; // convert to paise
    notes = { quizTitle: quiz.title, quizId: quiz._id.toString() };

  } else if (purchaseType === 'premium') {
    const months = premiumMonths || 1;
    const priceMap = { 1: 99, 3: 249, 6: 449, 12: 799 };
    amount = (priceMap[months] || 99) * 100;
    notes = { premiumMonths: months.toString() };
  } else {
    return res.status(400).json({ success: false, message: 'Invalid purchase type.' });
  }

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount,
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: { ...notes, userId: req.user._id.toString(), purchaseType }
  });

  // Save pending payment
  const payment = await Payment.create({
    user: req.user._id,
    purchaseType,
    quiz: purchaseType === 'quiz' ? quizId : null,
    amount,
    razorpayOrderId: razorpayOrder.id,
    premiumMonths: purchaseType === 'premium' ? (premiumMonths || 1) : 0,
    notes
  });

  res.json({
    success: true,
    data: {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
      userName: req.user.name,
      userEmail: req.user.email
    }
  });
};

// POST /api/payment/verify — called after successful payment from frontend
const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
  }

  // Find and update payment
  const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'paid';
  await payment.save();

  // Unlock access
  await unlockAccess(payment);

  res.json({
    success: true,
    message: '✅ Payment successful! Access unlocked.',
    data: { paymentId: payment._id, purchaseType: payment.purchaseType }
  });
};

// POST /api/payment/webhook — Razorpay webhook (raw body)
const handleWebhook = async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const receivedSignature = req.headers['x-razorpay-signature'];

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body) // raw buffer
    .digest('hex');

  if (receivedSignature !== expectedSignature) {
    console.error('❌ Webhook signature mismatch');
    return res.status(400).json({ success: false });
  }

  const event = JSON.parse(req.body.toString());
  console.log('📩 Webhook event:', event.event);

  if (event.event === 'payment.captured') {
    const { order_id, id: payment_id } = event.payload.payment.entity;
    const payment = await Payment.findOne({ razorpayOrderId: order_id });

    if (payment && payment.status !== 'paid') {
      payment.razorpayPaymentId = payment_id;
      payment.status = 'paid';
      payment.webhookVerified = true;
      await payment.save();
      await unlockAccess(payment);
    }
  }

  if (event.event === 'payment.failed') {
    const { order_id } = event.payload.payment.entity;
    await Payment.findOneAndUpdate(
      { razorpayOrderId: order_id },
      { status: 'failed', failureReason: event.payload.payment.entity.error_description || 'Payment failed' }
    );
  }

  res.json({ success: true });
};

// Helper: unlock quiz or premium
const unlockAccess = async (payment) => {
  if (payment.purchaseType === 'quiz') {
    await User.findByIdAndUpdate(payment.user, {
      $addToSet: { purchasedQuizzes: payment.quiz }
    });
  } else if (payment.purchaseType === 'premium') {
    const user = await User.findById(payment.user);
    const currentExpiry = user.premiumExpiresAt && user.premiumExpiresAt > new Date()
      ? user.premiumExpiresAt : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + payment.premiumMonths);

    await User.findByIdAndUpdate(payment.user, {
      isPremium: true,
      premiumExpiresAt: newExpiry
    });
  }
};

// GET /api/payment/history — user's payment history
const getPaymentHistory = async (req, res) => {
  const payments = await Payment.find({ user: req.user._id, status: 'paid' })
    .populate('quiz', 'title category')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: payments });
};

module.exports = { createOrder, verifyPayment, handleWebhook, getPaymentHistory };
