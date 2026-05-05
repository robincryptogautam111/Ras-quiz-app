const express = require('express');
const router = express.Router();
const { getQuizzes, getQuiz, startQuiz, submitQuiz, getDailyChallenge } = require('../controllers/quizController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getQuizzes);
router.get('/daily-challenge', optionalAuth, getDailyChallenge);
router.get('/:id', optionalAuth, getQuiz);
router.post('/:id/start', protect, startQuiz);
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
