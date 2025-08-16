const Points = require('../models/Points');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Add points for a user
const addPoints = asyncHandler(async (req, res) => {
  const { userId, points, description, category, action, metadata } = req.body;

  // Validate required fields
  if (!userId || !points || !description || !action) {
    return res.status(400).json({
      success: false,
      error: 'userId, points, description, and action are required'
    });
  }

  // Validate points value
  if (points <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Points must be greater than 0'
    });
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Create points record
  const pointsRecord = await Points.create({
    userId,
    points,
    description,
    category: category || 'other',
    action,
    metadata: metadata || {}
  });

  // Populate user information
  await pointsRecord.populate('userId', 'fullName email');

  res.status(201).json({
    success: true,
    message: 'Points added successfully',
    data: {
      id: pointsRecord._id,
      userId: pointsRecord.userId,
      points: pointsRecord.points,
      description: pointsRecord.description,
      category: pointsRecord.category,
      action: pointsRecord.action,
      metadata: pointsRecord.metadata,
      createdAt: pointsRecord.createdAt
    }
  });
});

// Get all points for a specific user
const getUserPoints = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, category, isActive = true } = req.query;

  // Validate user ID
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Build query
  const query = { userId, isActive: isActive === 'true' };
  if (category) {
    query.category = category;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPoints = await Points.countDocuments(query);
  const totalPages = Math.ceil(totalPoints / limit);

  // Get points with pagination
  const points = await Points.find(query)
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Calculate total points for the user
  const totalUserPoints = await Points.aggregate([
    { $match: { userId: user._id, isActive: true } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);

  const totalPointsValue = totalUserPoints.length > 0 ? totalUserPoints[0].total : 0;

  res.json({
    success: true,
    data: {
      points,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      },
      summary: {
        totalPoints: totalPointsValue,
        totalRecords: totalPoints
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPoints,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get all points (admin function)
const getAllPoints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, userId, category, isActive } = req.query;

  // Build query
  const query = {};
  if (userId) query.userId = userId;
  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPoints = await Points.countDocuments(query);
  const totalPages = Math.ceil(totalPoints / limit);

  // Get points with pagination
  const points = await Points.find(query)
    .populate('userId', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: {
      points,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPoints,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// Get points summary for a user
const getPointsSummary = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate user ID
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'User ID is required'
    });
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Get points summary by category
  const categorySummary = await Points.aggregate([
    { $match: { userId: user._id, isActive: true } },
    { $group: { _id: '$category', total: { $sum: '$points' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  // Get total points
  const totalPoints = await Points.aggregate([
    { $match: { userId: user._id, isActive: true } },
    { $group: { _id: null, total: { $sum: '$points' } } }
  ]);

  // Get recent activity
  const recentActivity = await Points.find({ userId: user._id, isActive: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('points description category action createdAt');

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      },
      summary: {
        totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0,
        totalRecords: await Points.countDocuments({ userId: user._id, isActive: true })
      },
      categoryBreakdown: categorySummary,
      recentActivity
    }
  });
});

// Update points record
const updatePoints = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { points, description, category, action, metadata, isActive } = req.body;

  // Find and update points record
  const updatedPoints = await Points.findByIdAndUpdate(
    id,
    {
      ...(points !== undefined && { points }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(action !== undefined && { action }),
      ...(metadata !== undefined && { metadata }),
      ...(isActive !== undefined && { isActive })
    },
    { new: true, runValidators: true }
  ).populate('userId', 'fullName email');

  if (!updatedPoints) {
    return res.status(404).json({
      success: false,
      error: 'Points record not found'
    });
  }

  res.json({
    success: true,
    message: 'Points updated successfully',
    data: updatedPoints
  });
});

// Delete points record (soft delete)
const deletePoints = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedPoints = await Points.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deletedPoints) {
    return res.status(404).json({
      success: false,
      error: 'Points record not found'
    });
  }

  res.json({
    success: true,
    message: 'Points record deleted successfully'
  });
});

module.exports = {
  addPoints,
  getUserPoints,
  getAllPoints,
  getPointsSummary,
  updatePoints,
  deletePoints
};
