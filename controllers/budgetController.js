const Budget = require('../models/Budget');
const Video = require('../models/Video');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Create a new budget
const createBudget = asyncHandler(async (req, res) => {
  const { 
    title, 
    description, 
    amount, 
    currency, 
    category, 
    startDate, 
    endDate, 
    isPublic, 
    tags, 
    metadata 
  } = req.body;

  // Validate required fields
  if (!title || !amount || !category) {
    return res.status(400).json({
      success: false,
      error: 'Title, amount, and category are required'
    });
  }

  // Validate amount
  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be greater than 0'
    });
  }

  // Create budget
  const budget = await Budget.create({
    title,
    description,
    amount,
    currency: currency || 'USD',
    category,
    startDate: startDate || new Date(),
    endDate,
    isPublic: isPublic || false,
    tags: tags || [],
    metadata: metadata || {},
    createdBy: req.user._id,
    videos: []
  });

  // Populate creator information
  await budget.populate('createdBy', 'fullName email');

  res.status(201).json({
    success: true,
    message: 'Budget created successfully',
    data: budget
  });
});

// Get all budgets for the authenticated user
const getUserBudgets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, isPublic } = req.query;

  // Build query
  const query = { createdBy: req.user._id };
  if (category) query.category = category;
  if (status) query.status = status;
  if (isPublic !== undefined) query.isPublic = isPublic === 'true';

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalBudgets = await Budget.countDocuments(query);
  const totalPages = Math.ceil(totalBudgets / limit);

  // Get budgets with pagination
  const budgets = await Budget.find(query)
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      budgets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBudgets,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get a specific budget by ID
const getBudgetById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const budget = await Budget.findById(id)
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl duration format size');

  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }

  // Check if user can access this budget
  if (!budget.isPublic && budget.createdBy._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this budget'
    });
  }

  res.json({
    success: true,
    data: budget
  });
});

// Add video to budget
const addVideoToBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { videoId, title, description } = req.body;

  // Validate required fields
  if (!videoId || !title) {
    return res.status(400).json({
      success: false,
      error: 'Video ID and title are required'
    });
  }

  // Check if budget exists and user owns it
  const budget = await Budget.findById(id);
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }

  if (budget.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only add videos to your own budgets'
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

  // Check if video is already in the budget
  const videoExists = budget.videos.find(v => v.videoId.toString() === videoId);
  if (videoExists) {
    return res.status(400).json({
      success: false,
      error: 'Video is already in this budget'
    });
  }

  // Add video to budget
  budget.videos.push({
    videoId,
    title,
    description: description || '',
    addedAt: new Date(),
    isActive: true
  });

  await budget.save();

  // Populate the updated budget
  await budget.populate('createdBy', 'fullName email');
  await budget.populate('videos.videoId', 'title description cloudinaryUrl');

  res.json({
    success: true,
    message: 'Video added to budget successfully',
    data: budget
  });
});

// Remove video from budget
const removeVideoFromBudget = asyncHandler(async (req, res) => {
  const { id, videoId } = req.params;

  // Check if budget exists and user owns it
  const budget = await Budget.findById(id);
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }

  if (budget.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only modify your own budgets'
    });
  }

  // Find and remove video
  const videoIndex = budget.videos.findIndex(v => v.videoId.toString() === videoId);
  if (videoIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Video not found in this budget'
    });
  }

  budget.videos.splice(videoIndex, 1);
  await budget.save();

  // Populate the updated budget
  await budget.populate('createdBy', 'fullName email');
  await budget.populate('videos.videoId', 'title description cloudinaryUrl');

  res.json({
    success: true,
    message: 'Video removed from budget successfully',
    data: budget
  });
});

// Update budget
const updateBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if budget exists and user owns it
  const budget = await Budget.findById(id);
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }

  if (budget.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only update your own budgets'
    });
  }

  // Update budget
  const updatedBudget = await Budget.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  )
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl');

  res.json({
    success: true,
    message: 'Budget updated successfully',
    data: updatedBudget
  });
});

// Delete budget
const deleteBudget = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if budget exists and user owns it
  const budget = await Budget.findById(id);
  if (!budget) {
    return res.status(404).json({
      success: false,
      error: 'Budget not found'
    });
  }

  if (budget.createdBy.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'You can only delete your own budgets'
    });
  }

  await Budget.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Budget deleted successfully'
  });
});

// Get public budgets (for discovery)
const getPublicBudgets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, createdBy } = req.query;

  // Build query for public budgets
  const query = { isPublic: true };
  if (category) query.category = category;
  if (createdBy) query.createdBy = createdBy;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalBudgets = await Budget.countDocuments(query);
  const totalPages = Math.ceil(totalBudgets / limit);

  // Get public budgets with pagination
  const budgets = await Budget.find(query)
    .populate('createdBy', 'fullName email')
    .populate('videos.videoId', 'title description cloudinaryUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      budgets,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalBudgets,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get budget statistics for user
const getBudgetStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get budget statistics
  const stats = await Budget.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: null,
        totalBudgets: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        averageAmount: { $avg: '$amount' },
        totalVideos: { $sum: { $size: '$videos' } }
      }
    }
  ]);

  // Get category breakdown
  const categoryBreakdown = await Budget.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);

  // Get status breakdown
  const statusBreakdown = await Budget.aggregate([
    { $match: { createdBy: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      overview: stats.length > 0 ? stats[0] : {
        totalBudgets: 0,
        totalAmount: 0,
        averageAmount: 0,
        totalVideos: 0
      },
      categoryBreakdown,
      statusBreakdown
    }
  });
});

module.exports = {
  createBudget,
  getUserBudgets,
  getBudgetById,
  addVideoToBudget,
  removeVideoFromBudget,
  updateBudget,
  deleteBudget,
  getPublicBudgets,
  getBudgetStats
};
