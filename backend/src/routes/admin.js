const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAllQuizzes, createQuiz, updateQuiz, deleteQuiz,
  getQuestions, createQuestion, updateQuestion, deleteQuestion, bulkUploadQuestions,
  getUsers, toggleBlockUser, deleteUser,
  getDashboard, getAllAttempts, getAllPayments, exportAttempts
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Dashboard
router.get('/dashboard', getDashboard);

// Quiz CRUD
router.get('/quizzes', getAllQuizzes);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// Question CRUD
router.get('/quizzes/:quizId/questions', getQuestions);
router.post('/quizzes/:quizId/questions', createQuestion);
router.post('/quizzes/:quizId/bulk-upload', bulkUploadQuestions);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);

// Users
router.get('/users', getUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

// Reports
router.get('/attempts', getAllAttempts);
router.get('/payments', getAllPayments);
router.get('/export/attempts', exportAttempts);

module.exports = router;
