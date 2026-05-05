const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  // Stats
  totalQuizAttempts: { type: Number, default: 0 },
  totalCorrect: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  // Rank system
  rank: {
    type: String,
    enum: ['Beginner', 'Explorer', 'Scholar', 'Expert', 'Master', 'Champion', 'Legend'],
    default: 'Beginner'
  },
  // Premium access
  isPremium: { type: Boolean, default: false },
  premiumExpiresAt: Date,
  // Purchased quizzes
  purchasedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  // Bookmarked questions
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  // Refresh token for JWT rotation
  refreshToken: { type: String, select: false },
  // Daily streak
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastQuizDate: Date,

}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update rank based on points
userSchema.methods.updateRank = function() {
  const pts = this.totalPoints;
  if (pts >= 10000) this.rank = 'Legend';
  else if (pts >= 5000) this.rank = 'Champion';
  else if (pts >= 2000) this.rank = 'Master';
  else if (pts >= 1000) this.rank = 'Expert';
  else if (pts >= 500) this.rank = 'Scholar';
  else if (pts >= 100) this.rank = 'Explorer';
  else this.rank = 'Beginner';
};

// Check if user has access to a quiz
userSchema.methods.hasQuizAccess = function(quizId) {
  if (this.role === 'admin') return true;
  if (this.isPremium && this.premiumExpiresAt > new Date()) return true;
  return this.purchasedQuizzes.some(id => id.toString() === quizId.toString());
};

// Accuracy percentage
userSchema.virtual('accuracy').get(function() {
  if (this.totalQuestions === 0) return 0;
  return Math.round((this.totalCorrect / this.totalQuestions) * 100);
});

userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
