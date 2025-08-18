const mongoose = require('mongoose');

const learningContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Content title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  categorySlug: {
    type: String,
    required: [true, 'Category slug is required']
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
      trim: true,
      maxlength: [200, 'Video title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Video description cannot exceed 500 characters']
    },
    duration: {
      type: Number,
      description: 'Video duration in seconds'
    },
    thumbnail: {
      type: String,
      description: 'Video thumbnail URL'
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
  resources: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['pdf', 'link', 'document', 'other'],
      default: 'link'
    },
    url: {
      type: String,
      trim: true
    },
    description: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
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
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for better query performance
learningContentSchema.index({ categorySlug: 1 });
learningContentSchema.index({ difficulty: 1 });
learningContentSchema.index({ isPublished: 1 });
learningContentSchema.index({ isPublic: 1 });
learningContentSchema.index({ 'videos.videoId': 1 });
learningContentSchema.index({ tags: 1 });

// Virtual for total videos count
learningContentSchema.virtual('totalVideos').get(function() {
  return this.videos.filter(video => video.isActive).length;
});

// Virtual for total duration
learningContentSchema.virtual('totalDuration').get(function() {
  return this.videos
    .filter(video => video.isActive && video.duration)
    .reduce((total, video) => total + video.duration, 0);
});



module.exports = mongoose.model('LearningContent', learningContentSchema);
