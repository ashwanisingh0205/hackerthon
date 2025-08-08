const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary ID is required']
  },
  cloudinaryUrl: {
    type: String,
    required: [true, 'Cloudinary URL is required']
  },
  duration: {
    type: Number,
    description: 'Video duration in seconds'
  },
  format: {
    type: String,
    required: [true, 'Video format is required']
  },
  size: {
    type: Number,
    description: 'Video size in bytes'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
videoSchema.index({ uploadedBy: 1, createdAt: -1 });
videoSchema.index({ tags: 1 });
videoSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Video', videoSchema);
