const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: [{
    type: String,
    required: [true, 'Question options are required'],
    trim: true
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Correct answer index must be 0 or greater']
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [500, 'Explanation cannot exceed 500 characters']
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Quiz title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number,
    description: 'Time limit in minutes (0 for no limit)',
    min: [0, 'Time limit must be 0 or greater'],
    default: 0
  },
  passingScore: {
    type: Number,
    description: 'Minimum score to pass (percentage)',
    min: [0, 'Passing score must be 0 or greater'],
    max: [100, 'Passing score cannot exceed 100'],
    default: 70
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
quizSchema.index({ createdBy: 1, createdAt: -1 });
quizSchema.index({ category: 1 });
quizSchema.index({ tags: 1 });
quizSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
