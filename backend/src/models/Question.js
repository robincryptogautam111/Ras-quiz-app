const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  options: [{
    text: { type: String, required: true, trim: true },
    image: { type: String, default: '' }
  }],
  correctOption: {
    type: Number, // index 0-3
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    trim: true,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  marks: { type: Number, default: 1 },
  negativeMarks: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  // Analytics
  totalAttempts: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 }
}, { timestamps: true });

questionSchema.virtual('accuracy').get(function() {
  if (this.totalAttempts === 0) return 0;
  return Math.round((this.totalCorrect / this.totalAttempts) * 100);
});

questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);
