const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const User = require('../models/User');
const Attempt = require('../models/Attempt');
const Payment = require('../models/Payment');
const xlsx = require('xlsx');

// ── QUIZ MANAGEMENT ────────────────────────────────────────────────

// GET /api/admin/quizzes
const getAllQuizzes = async (req, res) => {
  const quizzes = await Quiz.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: quizzes });
};

// POST /api/admin/quizzes
const createQuiz = async (req, res) => {
  const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, message: 'Quiz created!', data: quiz });
};

// PUT /api/admin/quizzes/:id
const updateQuiz = async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
  res.json({ success: true, message: 'Quiz updated!', data: quiz });
};

// DELETE /api/admin/quizzes/:id
const deleteQuiz = async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
  // Delete all questions
  await Question.deleteMany({ quiz: quiz._id });
  await Attempt.deleteMany({ quiz: quiz._id });
  await quiz.deleteOne();
  res.json({ success: true, message: 'Quiz and all its questions deleted.' });
};

// ── QUESTION MANAGEMENT ──────────────────────────────────────────

// GET /api/admin/quizzes/:quizId/questions
const getQuestions = async (req, res) => {
  const questions = await Question.find({ quiz: req.params.quizId }).sort({ order: 1 });
  res.json({ success: true, data: questions });
};

// POST /api/admin/quizzes/:quizId/questions
const createQuestion = async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

  const question = await Question.create({ ...req.body, quiz: quiz._id });
  quiz.questions.push(question._id);
  quiz.totalQuestions = quiz.questions.length;
  await quiz.save();

  res.status(201).json({ success: true, message: 'Question added!', data: question });
};

// PUT /api/admin/questions/:id
const updateQuestion = async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  res.json({ success: true, message: 'Question updated!', data: question });
};

// DELETE /api/admin/questions/:id
const deleteQuestion = async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  // Remove from quiz
  await Quiz.findByIdAndUpdate(question.quiz, { $pull: { questions: question._id } });
  await Quiz.findByIdAndUpdate(question.quiz, { $inc: { totalQuestions: -1 } });
  await question.deleteOne();
  res.json({ success: true, message: 'Question deleted.' });
};

// POST /api/admin/quizzes/:quizId/bulk-upload
const bulkUploadQuestions = async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || !questions.length) {
    return res.status(400).json({ success: false, message: 'No questions provided.' });
  }

  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

  const created = await Question.insertMany(
    questions.map((q, idx) => ({ ...q, quiz: quiz._id, order: idx }))
  );
  quiz.questions.push(...created.map(q => q._id));
  quiz.totalQuestions = quiz.questions.length;
  await quiz.save();

  res.status(201).json({ success: true, message: `${created.length} questions added!`, data: created });
};

// ── USER MANAGEMENT ──────────────────────────────────────────────

// GET /api/admin/users
const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = { role: 'user' };
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } }
  ];

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password -refreshToken')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
};

// PUT /api/admin/users/:id/toggle-block
const toggleBlockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully.`, data: { isActive: user.isActive } });
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role === 'admin') return res.status(404).json({ success: false, message: 'User not found.' });
  await Attempt.deleteMany({ user: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted.' });
};

// ── ANALYTICS & REPORTS ──────────────────────────────────────────

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  const [totalUsers, totalQuizzes, totalAttempts, totalRevenue, recentPayments, topQuizzes] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Quiz.countDocuments(),
    Attempt.countDocuments({ isCompleted: true }),
    Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Payment.find({ status: 'paid' }).populate('user', 'name email').populate('quiz', 'title').sort({ createdAt: -1 }).limit(5),
    Quiz.find({ isPublished: true }).sort({ totalAttempts: -1 }).limit(5).select('title category totalAttempts avgScore')
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalQuizzes,
        totalAttempts,
        totalRevenue: totalRevenue[0]?.total ? totalRevenue[0].total / 100 : 0
      },
      recentPayments,
      topQuizzes
    }
  });
};

// GET /api/admin/attempts — view all attempts
const getAllAttempts = async (req, res) => {
  const { quizId, page = 1, limit = 20 } = req.query;
  const filter = { isCompleted: true };
  if (quizId) filter.quiz = quizId;

  const total = await Attempt.countDocuments(filter);
  const attempts = await Attempt.find(filter)
    .populate('user', 'name email')
    .populate('quiz', 'title category')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  res.json({ success: true, data: attempts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
};

// GET /api/admin/payments
const getAllPayments = async (req, res) => {
  const payments = await Payment.find()
    .populate('user', 'name email')
    .populate('quiz', 'title')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: payments });
};

// GET /api/admin/export/attempts?quizId=xxx
const exportAttempts = async (req, res) => {
  const { quizId } = req.query;
  const filter = { isCompleted: true };
  if (quizId) filter.quiz = quizId;

  const attempts = await Attempt.find(filter)
    .populate('user', 'name email')
    .populate('quiz', 'title');

  const data = attempts.map(a => ({
    'User Name': a.user?.name || 'N/A',
    'Email': a.user?.email || 'N/A',
    'Quiz': a.quiz?.title || 'N/A',
    'Score': a.score,
    'Total Marks': a.totalMarks,
    'Percentage': a.percentage + '%',
    'Correct': a.correctAnswers,
    'Wrong': a.wrongAnswers,
    'Skipped': a.skipped,
    'Passed': a.isPassed ? 'Yes' : 'No',
    'Time (sec)': a.timeTaken,
    'Date': new Date(a.createdAt).toLocaleDateString('en-IN')
  }));

  const ws = xlsx.utils.json_to_sheet(data);
  const wb = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(wb, ws, 'Attempts');
  const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=attempts.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

module.exports = {
  getAllQuizzes, createQuiz, updateQuiz, deleteQuiz,
  getQuestions, createQuestion, updateQuestion, deleteQuestion, bulkUploadQuestions,
  getUsers, toggleBlockUser, deleteUser,
  getDashboard, getAllAttempts, getAllPayments, exportAttempts
};
