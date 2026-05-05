const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const { optionalAuth } = require('../middleware/auth');

// GET /api/leaderboard/global
router.get('/global', optionalAuth, async (req, res) => {
  const users = await User.find({ role: 'user', isActive: true })
    .select('name avatar rank totalPoints totalQuizAttempts')
    .sort({ totalPoints: -1 })
    .limit(50);

  const ranked = users.map((u, i) => ({
    position: i + 1,
    _id: u._id,
    name: u.name,
    avatar: u.avatar,
    rank: u.rank,
    totalPoints: u.totalPoints,
    totalAttempts: u.totalQuizAttempts,
    isCurrentUser: req.user ? req.user._id.toString() === u._id.toString() : false
  }));

  // Find current user's position if not in top 50
  let myPosition = null;
  if (req.user) {
    const myRank = await User.countDocuments({ totalPoints: { $gt: req.user.totalPoints }, role: 'user' });
    myPosition = myRank + 1;
  }

  res.json({ success: true, data: ranked, myPosition });
});

// GET /api/leaderboard/quiz/:quizId
router.get('/quiz/:quizId', async (req, res) => {
  const attempts = await Attempt.find({ quiz: req.params.quizId, isCompleted: true })
    .populate('user', 'name avatar rank')
    .sort({ percentage: -1, timeTaken: 1 })
    .limit(20);

  const ranked = attempts.map((a, i) => ({
    position: i + 1,
    user: a.user,
    score: a.score,
    percentage: a.percentage,
    timeTaken: a.timeTaken,
    date: a.createdAt
  }));

  res.json({ success: true, data: ranked });
});

module.exports = router;
