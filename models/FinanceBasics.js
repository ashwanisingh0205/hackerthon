const mongoose = require('mongoose');

const financeBasicsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  videoTitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Video title cannot exceed 200 characters']
  },
  videoDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Video description cannot exceed 500 characters']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number,
    description: 'Estimated time to complete in minutes',
    min: [1, 'Estimated time must be at least 1 minute']
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true,
    maxlength: [200, 'Learning objective cannot exceed 200 characters']
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },

  views: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
financeBasicsSchema.index({ difficulty: 1 });
financeBasicsSchema.index({ isPublished: 1 });
financeBasicsSchema.index({ tags: 1 });
financeBasicsSchema.index({ createdBy: 1 });
financeBasicsSchema.index({ createdAt: -1 });

module.exports = mongoose.model('FinanceBasics', financeBasicsSchema);
