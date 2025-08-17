const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { redisUtils } = require('../config/redis');

// Import all financial learning models
require('../models/FinanceBasics');
require('../models/SIPLearning');
require('../models/MutualFunds');
require('../models/FraudAwareness');
require('../models/TaxPlanning');

// ===== FINANCE BASICS MODULE =====

// Create finance basics content
const createFinanceBasics = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = [],
    isPublished = false
  } = req.body;

  // Validate required fields
  if (!title || !description || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, and video URL are required'
    });
  }

  // Create finance basics content
  const content = await mongoose.model('FinanceBasics').create({
    title,
    description,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    isPublished,
    createdBy: req.user._id,
    views: 0
  });

  // Invalidate cache
  await redisUtils.delPattern('cache:*/finance-basics*');

  res.status(201).json({
    success: true,
    message: 'Finance basics content created successfully',
    data: content
  });
});

// Get all finance basics content
const getFinanceBasics = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty, isPublished = true } = req.query;

  // Try to get from cache first
  const cacheKey = `finance-basics:${page}:${limit}:${difficulty}:${isPublished}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 Finance basics served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = { isPublished: isPublished === 'true' };
  if (difficulty) query.difficulty = difficulty;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await mongoose.model('FinanceBasics').countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await mongoose.model('FinanceBasics').find(query)
    .populate('createdBy', 'fullName email')
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

  // Cache for 1 hour
  await redisUtils.set(cacheKey, responseData, 3600);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

// ===== SIP LEARNING MODULE =====

// Create SIP learning content
const createSIPLearning = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = [],
    isPublished = false
  } = req.body;

  // Validate required fields
  if (!title || !description || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, and video URL are required'
    });
  }

  // Create SIP learning content
  const content = await mongoose.model('SIPLearning').create({
    title,
    description,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    isPublished,
    createdBy: req.user._id,
    views: 0
  });

  // Invalidate cache
  await redisUtils.delPattern('cache:*/sip-learning*');

  res.status(201).json({
    success: true,
    message: 'SIP learning content created successfully',
    data: content
  });
});

// Get all SIP learning content
const getSIPLearning = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty, isPublished = true } = req.query;

  // Try to get from cache first
  const cacheKey = `sip-learning:${page}:${limit}:${difficulty}:${isPublished}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 SIP learning served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = { isPublished: isPublished === 'true' };
  if (difficulty) query.difficulty = difficulty;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await mongoose.model('SIPLearning').countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await mongoose.model('SIPLearning').find(query)
    .populate('createdBy', 'fullName email')
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

  // Cache for 1 hour
  await redisUtils.set(cacheKey, responseData, 3600);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

// ===== MUTUAL FUNDS MODULE =====

// Create mutual funds content
const createMutualFunds = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = [],
    isPublished = false
  } = req.body;

  // Validate required fields
  if (!title || !description || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, and video URL are required'
    });
  }

  // Create mutual funds content
  const content = await mongoose.model('MutualFunds').create({
    title,
    description,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    isPublished,
    createdBy: req.user._id,
    views: 0
  });

  // Invalidate cache
  await redisUtils.delPattern('cache:*/mutual-funds*');

  res.status(201).json({
    success: true,
    message: 'Mutual funds content created successfully',
    data: content
  });
});

// Get all mutual funds content
const getMutualFunds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty, isPublished = true } = req.query;

  // Try to get from cache first
  const cacheKey = `mutual-funds:${page}:${limit}:${difficulty}:${isPublished}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 Mutual funds served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = { isPublished: isPublished === 'true' };
  if (difficulty) query.difficulty = difficulty;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await mongoose.model('MutualFunds').countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await mongoose.model('MutualFunds').find(query)
    .populate('createdBy', 'fullName email')
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

  // Cache for 1 hour
  await redisUtils.set(cacheKey, responseData, 3600);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

// ===== FRAUD AWARENESS MODULE =====

// Create fraud awareness content
const createFraudAwareness = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = [],
    isPublished = false
  } = req.body;

  // Validate required fields
  if (!title || !description || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, and video URL are required'
    });
  }

  // Create fraud awareness content
  const content = await mongoose.model('FraudAwareness').create({
    title,
    description,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    isPublished,
    createdBy: req.user._id,
    views: 0
  });

  // Invalidate cache
  await redisUtils.delPattern('cache:*/fraud-awareness*');

  res.status(201).json({
    success: true,
    message: 'Fraud awareness content created successfully',
    data: content
  });
});

// Get all fraud awareness content
const getFraudAwareness = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty, isPublished = true } = req.query;

  // Try to get from cache first
  const cacheKey = `fraud-awareness:${page}:${limit}:${difficulty}:${isPublished}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 Fraud awareness served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = { isPublished: isPublished === 'true' };
  if (difficulty) query.difficulty = difficulty;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await mongoose.model('FraudAwareness').countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await mongoose.model('FraudAwareness').find(query)
    .populate('createdBy', 'fullName email')
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

  // Cache for 1 hour
  await redisUtils.set(cacheKey, responseData, 3600);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

// ===== TAX PLANNING MODULE =====

// Create tax planning content
const createTaxPlanning = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = [],
    isPublished = false
  } = req.body;

  // Validate required fields
  if (!title || !description || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, and video URL are required'
    });
  }

  // Create tax planning content
  const content = await mongoose.model('TaxPlanning').create({
    title,
    description,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    isPublished,
    createdBy: req.user._id,
    views: 0
  });

  // Invalidate cache
  await redisUtils.delPattern('cache:*/tax-planning*');

  res.status(201).json({
    success: true,
    message: 'Tax planning content created successfully',
    data: content
  });
});

// Get all tax planning content
const getTaxPlanning = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty, isPublished = true } = req.query;

  // Try to get from cache first
  const cacheKey = `tax-planning:${page}:${limit}:${difficulty}:${isPublished}`;
  const cachedContent = await redisUtils.get(cacheKey);
  
  if (cachedContent) {
    console.log('📦 Tax planning served from cache');
    return res.json({
      success: true,
      data: cachedContent,
      fromCache: true
    });
  }

  // Build query
  const query = { isPublished: isPublished === 'true' };
  if (difficulty) query.difficulty = difficulty;

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalContent = await mongoose.model('TaxPlanning').countDocuments(query);
  const totalPages = Math.ceil(totalContent / limit);

  // Get content with pagination
  const content = await mongoose.model('TaxPlanning').find(query)
    .populate('createdBy', 'fullName email')
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

  // Cache for 1 hour
  await redisUtils.set(cacheKey, responseData, 3600);

  res.json({
    success: true,
    data: responseData,
    fromCache: false
  });
});

module.exports = {
  // Finance Basics
  createFinanceBasics,
  getFinanceBasics,
  
  // SIP Learning
  createSIPLearning,
  getSIPLearning,
  
  // Mutual Funds
  createMutualFunds,
  getMutualFunds,
  
  // Fraud Awareness
  createFraudAwareness,
  getFraudAwareness,
  
  // Tax Planning
  createTaxPlanning,
  getTaxPlanning
};
