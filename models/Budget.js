const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Budget title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Budget category is required'],
    trim: true,
    enum: ['personal', 'business', 'education', 'entertainment', 'health', 'travel', 'other'],
    default: 'personal'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'on-hold'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        if (!value) return true; // Allow empty/null values
        return value >= this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  videos: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    addedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
budgetSchema.index({ createdBy: 1, createdAt: -1 });
budgetSchema.index({ category: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ isPublic: 1 });
budgetSchema.index({ 'videos.videoId': 1 });

// Virtual for total videos count
budgetSchema.virtual('totalVideos').get(function() {
  return this.videos.filter(video => video.isActive).length;
});

// Virtual for budget utilization percentage
budgetSchema.virtual('utilizationPercentage').get(function() {
  if (this.amount <= 0) return 0;
  // This can be calculated based on actual spending vs budget
  return 0; // Placeholder for future spending tracking
});

// Pre-save middleware to ensure endDate is after startDate
budgetSchema.pre('save', function(next) {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
