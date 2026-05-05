const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number, default: -1 }, // -1 = skipped
    isCorrect: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 } // seconds
  }],
  score: { type: Number, default: 0 },
  totalMarks: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  skipped: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 }, // total seconds
  isPassed: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  rank: { type: Number, default: 0 } // rank in this quiz
}, { timestamps: true });

// Calculate stats before save
attemptSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    this.correctAnswers = this.answers.filter(a => a.isCorrect).length;
    this.wrongAnswers = this.answers.filter(a => !a.isCorrect && a.selectedOption !== -1).length;
    this.skipped = this.answers.filter(a => a.selectedOption === -1).length;
  }
  next();
});

module.exports = mongoose.model('Attempt', attemptSchema);
