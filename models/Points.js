const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  points: {
    type: Number,
    required: [true, 'Points are required'],
    min: [0, 'Points cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['quiz', 'upload', 'login', 'referral', 'achievement', 'other'],
    default: 'other'
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [100, 'Action cannot exceed 100 characters']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
pointsSchema.index({ userId: 1, createdAt: -1 });
pointsSchema.index({ category: 1 });
pointsSchema.index({ isActive: 1 });

// Virtual for total points calculation
pointsSchema.virtual('totalPoints').get(function() {
  return this.points;
});

module.exports = mongoose.model('Points', pointsSchema);
