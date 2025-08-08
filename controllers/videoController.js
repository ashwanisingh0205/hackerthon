const Video = require('../models/Video');
const { cloudinary } = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');

// Upload video to Cloudinary
const uploadVideo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No video uploaded'
    });
  }

  const { title, description, tags, isPublic } = req.body;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'videos',
      transformation: [
        { width: 1280, height: 720, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    // Create video record in database
    const video = await Video.create({
      title: title || req.file.originalname,
      description: description || '',
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url,
      duration: result.duration,
      format: result.format,
      size: result.bytes,
      uploadedBy: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic !== 'false'
    });

    // Clean up local file
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      data: {
        id: video._id,
        title: video.title,
        description: video.description,
        cloudinaryUrl: video.cloudinaryUrl,
        duration: video.duration,
        format: video.format,
        size: video.size,
        tags: video.tags,
        isPublic: video.isPublic,
        uploadedAt: video.createdAt
      }
    });
  } catch (error) {
    // Clean up local file on error
    const fs = require('fs');
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw error;
  }
});

// Get all videos (with pagination and filtering)
const getVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, tags, isPublic } = req.query;
  const skip = (page - 1) * limit;

  // Build filter object
  const filter = {};
  
  // If not admin, only show public videos or user's own videos
  if (!req.user.isAdmin) {
    filter.$or = [
      { isPublic: true },
      { uploadedBy: req.user._id }
    ];
  }
  
  if (search) {
    filter.$and = filter.$and || [];
    filter.$and.push({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    });
  }
  
  if (tags) {
    filter.tags = { $in: tags.split(',').map(tag => tag.trim()) };
  }
  
  if (isPublic !== undefined) {
    filter.isPublic = isPublic === 'true';
  }

  const videos = await Video.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('uploadedBy', 'fullName email');

  const total = await Video.countDocuments(filter);

  res.json({
    success: true,
    data: {
      videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVideos: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get single video
const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id)
    .populate('uploadedBy', 'fullName email');

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check access permissions
  if (!video.isPublic && video.uploadedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Increment views
  video.views += 1;
  await video.save();

  res.json({
    success: true,
    data: video
  });
});

// Update video
const updateVideo = asyncHandler(async (req, res) => {
  const { title, description, tags, isPublic } = req.body;
  
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check if user has access to this video
  if (video.uploadedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    req.params.id,
    {
      title: title || video.title,
      description: description || video.description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : video.tags,
      isPublic: isPublic !== undefined ? isPublic === 'true' : video.isPublic
    },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Video updated successfully',
    data: updatedVideo
  });
});

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check if user has access to this video
  if (video.uploadedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(video.cloudinaryId, { resource_type: 'video' });
    
    // Delete from database
    await Video.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    // If Cloudinary deletion fails, still delete from database
    await Video.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Video deleted from database (Cloudinary cleanup may be pending)'
    });
  }
});

// Get video stream URL
const getVideoStream = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    return res.status(404).json({
      success: false,
      error: 'Video not found'
    });
  }

  // Check access permissions
  if (!video.isPublic && video.uploadedBy.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Generate streaming URL with transformations
  const streamingUrl = cloudinary.url(video.cloudinaryId, {
    resource_type: 'video',
    transformation: [
      { width: 1280, height: 720, crop: 'limit' },
      { quality: 'auto' }
    ]
  });

  res.json({
    success: true,
    data: {
      streamingUrl,
      originalUrl: video.cloudinaryUrl,
      title: video.title,
      duration: video.duration
    }
  });
});

module.exports = {
  uploadVideo,
  getVideos,
  getVideo,
  updateVideo,
  deleteVideo,
  getVideoStream
};
