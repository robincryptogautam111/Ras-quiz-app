require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const quizRoutes = require('./routes/quiz');
const questionRoutes = require('./routes/question');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();

// Connect Database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: 'https://ras-quiz-app.vercel.app',
  credentials: true
}));

// Razorpay webhook needs raw body — mount BEFORE json parser
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Auth rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts.' }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'RAS Quiz API is running 🚀', env: process.env.NODE_ENV });
});

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
