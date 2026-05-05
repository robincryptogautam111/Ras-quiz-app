const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

// GET /api/quizzes — list all published quizzes
const getQuizzes = async (req, res) => {
  const { category, difficulty, type, page = 1, limit = 12, search } = req.query;
  const filter = { isPublished: true, isActive: true };

  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (type) filter.type = type;
  if (search) filter.title = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;
  const total = await Quiz.countDocuments(filter);
  const quizzes = await Quiz.find(filter)
    .select('-questions')
    .sort({ isFeatured: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: quizzes,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
  });
};

// GET /api/quizzes/:id — single quiz (without correct answers)
const getQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id)
    .populate('questions', '-correctOption -explanation');

  if (!quiz || !quiz.isPublished || !quiz.isActive) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  // Check access for paid quiz
  if (quiz.type === 'paid' && req.user) {
    const hasAccess = req.user.hasQuizAccess(quiz._id);
    return res.json({ success: true, data: { ...quiz.toJSON(), hasAccess } });
  }

  res.json({ success: true, data: { ...quiz.toJSON(), hasAccess: quiz.type === 'free' } });
};

// POST /api/quizzes/:id/start — start quiz attempt
const startQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('questions');
  if (!quiz || !quiz.isPublished) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  // Check access
  if (quiz.type === 'paid') {
    const hasAccess = req.user.hasQuizAccess(quiz._id);
    if (!hasAccess) {
      return res.status(403).json({ success: false, message: 'Purchase required to attempt this quiz.' });
    }
  }

  // Return questions WITHOUT correct answers
  const questions = quiz.questions.map(q => ({
    _id: q._id,
    text: q.text,
    image: q.image,
    options: q.options,
    marks: q.marks,
    negativeMarks: q.negativeMarks,
    order: q.order
  }));

  res.json({
    success: true,
    data: {
      quizId: quiz._id,
      title: quiz.title,
      duration: quiz.duration,
      questionTimer: quiz.questionTimer,
      totalQuestions: questions.length,
      passingScore: quiz.passingScore,
      questions
    }
  });
};

// POST /api/quizzes/:id/submit — submit quiz answers
const submitQuiz = async (req, res) => {
  const { answers, timeTaken } = req.body; // answers: [{questionId, selectedOption}]
  const quiz = await Quiz.findById(req.params.id).populate('questions');

  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  let score = 0, totalMarks = 0;
  const processedAnswers = [];

  for (const question of quiz.questions) {
    totalMarks += question.marks;
    const userAnswer = answers.find(a => a.questionId === question._id.toString());
    const selectedOption = userAnswer ? userAnswer.selectedOption : -1;
    const isCorrect = selectedOption === question.correctOption;

    if (isCorrect) {
      score += question.marks;
    } else if (selectedOption !== -1 && question.negativeMarks > 0) {
      score -= question.negativeMarks;
    }

    processedAnswers.push({
      question: question._id,
      selectedOption,
      isCorrect,
      timeTaken: userAnswer?.timeTaken || 0
    });

    // Update question analytics
    await Question.findByIdAndUpdate(question._id, {
      $inc: { totalAttempts: 1, ...(isCorrect && { totalCorrect: 1 }) }
    });
  }

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const isPassed = percentage >= quiz.passingScore;

  // Save attempt
  const attempt = await Attempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers: processedAnswers,
    score: Math.max(0, score),
    totalMarks,
    percentage: Math.max(0, percentage),
    timeTaken: timeTaken || 0,
    isPassed,
    isCompleted: true
  });

  // Update user stats
  const points = isPassed ? Math.round(percentage / 10) * 5 : 1;
  await User.findByIdAndUpdate(req.user._id, {
    $inc: {
      totalQuizAttempts: 1,
      totalCorrect: attempt.correctAnswers,
      totalQuestions: quiz.questions.length,
      totalPoints: points
    }
  });
  const user = await User.findById(req.user._id);
  user.updateRank();
  await user.save();

  // Update quiz stats
  const allAttempts = await Attempt.find({ quiz: quiz._id, isCompleted: true });
  const avgScore = allAttempts.reduce((sum, a) => sum + a.percentage, 0) / allAttempts.length;
  await Quiz.findByIdAndUpdate(quiz._id, {
    $inc: { totalAttempts: 1 },
    avgScore: Math.round(avgScore)
  });

  // Return with correct answers and explanations
  const detailedAnswers = processedAnswers.map(pa => {
    const q = quiz.questions.find(q => q._id.toString() === pa.question.toString());
    return {
      questionId: pa.question,
      questionText: q.text,
      selectedOption: pa.selectedOption,
      correctOption: q.correctOption,
      isCorrect: pa.isCorrect,
      explanation: q.explanation,
      options: q.options
    };
  });

  res.json({
    success: true,
    message: isPassed ? '🎉 Congratulations! You passed!' : 'Quiz submitted. Better luck next time!',
    data: {
      attemptId: attempt._id,
      score: Math.max(0, score),
      totalMarks,
      percentage: Math.max(0, percentage),
      correctAnswers: attempt.correctAnswers,
      wrongAnswers: attempt.wrongAnswers,
      skipped: attempt.skipped,
      isPassed,
      pointsEarned: points,
      newRank: user.rank,
      timeTaken,
      detailedAnswers
    }
  });
};

// GET /api/quizzes/daily-challenge
const getDailyChallenge = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const quiz = await Quiz.findOne({
    isDailyChallenge: true,
    dailyChallengeDate: { $gte: today, $lt: tomorrow },
    isActive: true
  }).select('-questions');

  res.json({ success: true, data: quiz });
};

module.exports = { getQuizzes, getQuiz, startQuiz, submitQuiz, getDailyChallenge };
