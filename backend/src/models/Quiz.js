const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: 150
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['Rajasthan History', 'Indian History', 'Geography', 'Indian Polity',
           'Economy', 'Science & Tech', 'Current Affairs', 'Rajasthan GK',
           'Environment', 'Art & Culture', 'Maths & Reasoning', 'English', 'General'],
    default: 'General'
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  type: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  // Timer per quiz in seconds (e.g., 1800 = 30 mins)
  duration: {
    type: Number,
    default: 1800,
    min: 60
  },
  // Per-question timer in seconds (0 = no per-question timer)
  questionTimer: {
    type: Number,
    default: 30,
    min: 0
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  totalQuestions: { type: Number, default: 0 },
  passingScore: { type: Number, default: 60 }, // percentage
  thumbnail: { type: String, default: '' },
  tags: [String],
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isDailyChallenge: { type: Boolean, default: false },
  dailyChallengeDate: Date,
  // Attempt stats
  totalAttempts: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Update totalQuestions count
quizSchema.pre('save', function(next) {
  this.totalQuestions = this.questions.length;
  next();
});

module.exports = mongoose.model('Quiz', quizSchema);
