// routes/user.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Attempt = require('../models/Attempt');
const User = require('../models/User');
const Question = require('../models/Question');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('purchasedQuizzes', 'title category');
  res.json({ success: true, data: user });
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  const { name, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  );
  res.json({ success: true, message: 'Profile updated!', data: user });
});

// GET /api/users/history
router.get('/history', protect, async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const total = await Attempt.countDocuments({ user: req.user._id, isCompleted: true });
  const attempts = await Attempt.find({ user: req.user._id, isCompleted: true })
    .populate('quiz', 'title category difficulty thumbnail')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, data: attempts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
});

// GET /api/users/bookmarks
router.get('/bookmarks', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarks',
    populate: { path: 'quiz', select: 'title' }
  });
  res.json({ success: true, data: user.bookmarks });
});

// POST /api/users/bookmarks/:questionId
router.post('/bookmarks/:questionId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const qId = req.params.questionId;
  const isBookmarked = user.bookmarks.includes(qId);

  if (isBookmarked) {
    user.bookmarks.pull(qId);
  } else {
    user.bookmarks.push(qId);
  }
  await user.save();

  res.json({
    success: true,
    message: isBookmarked ? 'Bookmark removed.' : 'Question bookmarked!',
    data: { isBookmarked: !isBookmarked }
  });
});

// GET /api/users/stats
router.get('/stats', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  const attempts = await Attempt.find({ user: req.user._id, isCompleted: true })
    .populate('quiz', 'category');

  // Category-wise breakdown
  const categoryStats = {};
  attempts.forEach(a => {
    const cat = a.quiz?.category || 'Unknown';
    if (!categoryStats[cat]) categoryStats[cat] = { attempts: 0, totalScore: 0 };
    categoryStats[cat].attempts++;
    categoryStats[cat].totalScore += a.percentage;
  });

  Object.keys(categoryStats).forEach(cat => {
    categoryStats[cat].avgScore = Math.round(categoryStats[cat].totalScore / categoryStats[cat].attempts);
  });

  res.json({
    success: true,
    data: {
      totalAttempts: user.totalQuizAttempts,
      totalPoints: user.totalPoints,
      accuracy: user.accuracy,
      rank: user.rank,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      categoryStats
    }
  });
});

module.exports = router;
