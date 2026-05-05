const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, handleWebhook, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook uses raw body (mounted before json parser in server.js)
router.post('/webhook', handleWebhook);

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;
