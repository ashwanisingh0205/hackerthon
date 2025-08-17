const mongoose = require('mongoose');
const LearningContent = require('../models/LearningContent');
const Video = require('../models/Video');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { redisUtils } = require('../config/redis');



// ===== LEARNING CONTENT =====

// Create learning content
const createContent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    categorySlug,
    category, // Handle old format for backward compatibility
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    resources,
    isPublished,
    isPublic
  } = req.body;

  // Handle both new and old category formats
  let finalCategorySlug = categorySlug;
  if (!finalCategorySlug && category) {
    if (typeof category === 'string') {
      finalCategorySlug = category;
      console.log('📝 Using category string as categorySlug:', finalCategorySlug);
    } else if (typeof category === 'object' && category.slug) {
      finalCategorySlug = category.slug;
      console.log('📝 Extracted categorySlug from category object:', finalCategorySlug);
    }
  }
  
  if (finalCategorySlug) {
    console.log('📝 Final categorySlug:', finalCategorySlug);
  }

  // Validate required fields
  if (!title || !finalCategorySlug) {
    return res.status(400).json({
      success: false,
      error: 'Title and category slug are required'
    });
  }

  // Create content
  const content = await LearningContent.create({
    title,
    description,
    categorySlug: finalCategorySlug,
    difficulty: difficulty || 'beginner',
    estimatedTime,
    tags: tags || [],
    prerequisites: prerequisites || [],
    learningObjectives: learningObjectives || [],
    resources: resources || [],
    isPublished: isPublished || false,
    isPublic: isPublic !== undefined ? isPublic : true,
    createdBy: req.user._id,
    videos: []
  });

  // Populate creator information
  await content.populate('createdBy', 'fullName email');

  // Invalidate related caches
  await redisUtils.delPattern('cache:*/learning/content*');
  await redisUtils.delPattern(`cache:*/learning/content/category/${finalCategorySlug}*`);

  res.status(201).json({
    success: true,
    message: 'Learning content created successfully',
    data: content,
    categorySlug: finalCategorySlug
  });
});

// Get learning content by category
const getContentByCategory = asyncHandler(async (req, res) => {
  const { categorySlug } = req.params;
  const { page = 1, limit = 10, difficulty, isPublished = true } = req.query;

  // Try to get from cache first
  const cacheKey = `content:category:${categorySlug}:${page}:${limit}:${difficulty}:${isPublished}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 Content served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = { 
    categorySlug, 
    isPublished: isPublished === 'true',
    isPublic: true
  };
  
  if (difficulty) {
    query.difficulty = difficulty;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await LearningContent.countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await LearningContent.find(query)
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl duration')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const responseData = {
    categorySlug,
    content,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalContent,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };

  // Cache content for 2 hours
  await redisUtils.set(cacheKey, responseData, 7200);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

// Get specific learning content
const getContentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID format'
    });
  }

  // Try to get from cache first
  const cacheKey = `content:${id}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 Content served from cache');
    // Increment views in cache
    await redisUtils.hincrby(`content:views:${id}`, 'views', 1);
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  const content = await LearningContent.findById(id)
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl duration format size');

  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Learning content not found'
    });
  }

  // Check if user can access this content
  if (!content.isPublic && content.createdBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this content'
    });
  }

  // Increment views
  content.views += 1;
  await content.save();

  // Cache content for 1 hour
  await redisUtils.set(cacheKey, content, 3600);

  // Cache views separately for faster updates
  await redisUtils.hset(`content:views:${id}`, 'views', content.views);

  res.json({
    success: true,
    data: content,
    fromCache: false
  });
});

// Add video to learning content
const addVideoToContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { videoId, title, description, order } = req.body;

  // Validate ObjectId formats
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID format'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID format'
    });
  }

  // Validate required fields
  if (!videoId || !title) {
    return res.status(400).json({
      success: false,
      error: 'Video ID and title are required'
    });
  }

  // Check if content exists and user owns it
  const content = await LearningContent.findById(id);
  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Learning content not found'
    });
  }

  if (content.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only add videos to your own content'
    });
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check if video is already in the content
  const videoExists = content.videos.find(v => v.videoId.toString() === videoId);
  if (videoExists) {
    return res.status(400).json({
      success: false,
      error: 'Video is already in this content'
    });
  }

  // Add video to content
  content.videos.push({
    videoId,
    title,
    description: description || '',
    duration: video.duration,
    thumbnail: video.cloudinaryUrl,
    order: order || content.videos.length,
    isActive: true,
    addedAt: new Date()
  });

  await content.save();

  // Populate the updated content
  await content.populate('createdBy', 'fullName email');
  await content.populate('videos.videoId', 'title description cloudinaryUrl duration');

  // Invalidate related caches
  await redisUtils.del(`content:${id}`);
  await redisUtils.delPattern(`cache:*/learning/content/category/${content.categorySlug}*`);

  res.json({
    success: true,
    message: 'Video added to learning content successfully',
    data: content
  });
});

// Remove video from learning content
const removeVideoFromContent = asyncHandler(async (req, res) => {
  const { id, videoId } = req.params;

  // Validate ObjectId formats
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID format'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID format'
    });
  }

  // Check if content exists and user owns it
  const content = await LearningContent.findById(id);
  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Learning content not found'
    });
  }

  if (content.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only modify your own content'
    });
  }

  // Find and remove video
  const videoIndex = content.videos.findIndex(v => v.videoId.toString() === videoId);
  if (videoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Video not found in this content'
    });
  }

  content.videos.splice(videoIndex, 1);
  await content.save();

  // Populate the updated content
  await content.populate('createdBy', 'fullName email');
  await content.populate('videos.videoId', 'title description cloudinaryUrl duration');

  // Invalidate related caches
  await redisUtils.del(`content:${id}`);
  await redisUtils.delPattern(`cache:*/learning/content/category/${content.categorySlug}*`);

  res.json({
    success: true,
    message: 'Video removed from content successfully',
    data: content
  });
});

// Get all learning content (admin function)
const getAllContent = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, categorySlug, difficulty, isPublished, createdBy } = req.query;

  // Try to get from cache first
  const cacheKey = `content:all:${page}:${limit}:${categorySlug}:${difficulty}:${isPublished}:${createdBy}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 All content served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = {};
  
  // Validate ObjectId format for createdBy parameter
  if (createdBy && !mongoose.Types.ObjectId.isValid(createdBy)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid createdBy ID format'
    });
  }
  
  if (categorySlug) query.categorySlug = categorySlug;
  if (difficulty) query.difficulty = difficulty;
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';
  if (createdBy) query.createdBy = createdBy;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await LearningContent.countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await LearningContent.find(query)
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl duration')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const responseData = {
    content,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalContent,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };

  // Cache content for 30 minutes
  await redisUtils.set(cacheKey, responseData, 1800);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

// Update learning content
const updateContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID format'
    });
  }

  // Check if content exists and user owns it
  const content = await LearningContent.findById(id);
  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Learning content not found'
    });
  }

  if (content.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own content'
    });
  }

  // Update content
  const updatedContent = await LearningContent.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl duration');

  // Invalidate related caches
  await redisUtils.del(`content:${id}`);
  await redisUtils.delPattern(`cache:*/learning/content*`);
  await redisUtils.delPattern(`cache:*/learning/content/category/${updatedContent.categorySlug}*`);

  res.json({
    success: true,
    message: 'Learning content updated successfully',
    data: updatedContent
  });
});

// Delete learning content
const deleteContent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid content ID format'
    });
  }

  // Check if content exists and user owns it
  const content = await LearningContent.findById(id);
  if (!content) {
    return res.status(404).json({
      success: false,
      error: 'Learning content not found'
    });
  }

  if (content.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete your own content'
    });
  }

  await LearningContent.findByIdAndDelete(id);

  // Invalidate related caches
  await redisUtils.del(`content:${id}`);
  await redisUtils.delPattern(`cache:*/learning/content*`);
  await redisUtils.delPattern(`cache:*/learning/content/category/${content.categorySlug}*`);

  res.json({
    success: true,
    message: 'Learning content deleted successfully'
  });
});

// Get learning dashboard statistics
const getLearningStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Try to get from cache first
  const cacheKey = `stats:learning:${userId}`;
  const cachedStats = await redisUtils.get(cacheKey);
  
  if (cachedStats) {
    console.log('📦 Learning stats served from cache');
    return res.json({
      success: true,
      data: cachedStats,
      fromCache: true
    });
  }

  // Get content statistics
  const contentStats = await LearningContent.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: null,
        totalContent: { $sum: 1 },
        publishedContent: { $sum: { $cond: ['$isPublished', 1, 0] } },
        totalVideos: { $sum: { $size: '$videos' } },
        totalViews: { $sum: '$views' }
      }
    }
  ]);

  // Get category breakdown
  const categoryBreakdown = await LearningContent.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$categorySlug',
        count: { $sum: 1 },
        totalViews: { $sum: '$views' }
      }
    },
    { $sort: { totalViews: -1 } }
  ]);

  // Get difficulty breakdown
  const difficultyBreakdown = await LearningContent.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$difficulty',
        count: { $sum: 1 }
      }
    }
  ]);

  const responseData = {
    overview: contentStats.length > 0 ? contentStats[0] : {
      totalContent: 0,
      publishedContent: 0,
      totalVideos: 0,
      totalViews: 0
    },
    categoryBreakdown,
    difficultyBreakdown
  };

  // Cache stats for 15 minutes
  await redisUtils.set(cacheKey, responseData, 900);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

module.exports = {
  // Content functions
  createContent,
  getContentByCategory,
  getContentById,
  addVideoToContent,
  removeVideoFromContent,
  getAllContent,
  updateContent,
  deleteContent,
  getLearningStats
};
