const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// Import all financial learning models
require('../models/FinanceBasics');
require('../models/SIPLearning');
require('../models/MutualFunds');
require('../models/FraudAwareness');
require('../models/TaxPlanning');

// ===== FINANCE BASICS MODULE =====

// Create finance basics content
const createFinanceBasics = asyncHandler(async (req, res) => {
  try {
    console.log('📝 Creating finance basics content...');
    console.log('📋 Request body:', req.body);
    console.log('👤 User ID:', req.user._id);
    
    const {
      title,
      description,
      content,
      detailedContent,
      videoUrl,
      videoTitle,
      videoDescription,
      difficulty = 'beginner',
      estimatedTime,
      tags = [],
      prerequisites = [],
      learningObjectives = []
    } = req.body;

    // Validate required fields
    if (!title || !description || !content || !videoUrl) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Title, description, content, and video URL are required'
      });
    }

    console.log('✅ Validation passed, creating content...');

    // Create finance basics content
    const createdContent = await mongoose.model('FinanceBasics').create({
      title,
      description,
      content,
      detailedContent,
      videoUrl,
      videoTitle: videoTitle || title,
      videoDescription: videoDescription || description,
      difficulty,
      estimatedTime,
      tags,
      prerequisites,
      learningObjectives,
      createdBy: req.user._id,
      views: 0
    });

    console.log('✅ Content created successfully:', createdContent._id);

    res.status(201).json({
      success: true,
      message: 'Finance basics content created successfully',
      data: createdContent
    });
  } catch (error) {
    console.error('❌ Error creating finance basics content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create finance basics content',
      details: error.message
    });
  }
});

// Get all finance basics content
const getFinanceBasics = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty } = req.query;

  try {
    console.log('🔍 Fetching finance basics with query:', { page, limit, difficulty });

    // Build query
    const query = {};
    
    if (difficulty) query.difficulty = difficulty;

    console.log('🔍 Database query:', query);

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalContent = await mongoose.model('FinanceBasics').countDocuments(query);
    const totalPages = Math.ceil(totalContent / limit);

    console.log(`📊 Total content found: ${totalContent}`);

    // Get content with pagination
    const content = await mongoose.model('FinanceBasics').find(query)
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`📋 Retrieved ${content.length} content items`);

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

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Error in getFinanceBasics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch finance basics content',
      details: error.message
    });
  }
});

// Get all finance basics content (unfiltered - for debugging)
const getAllFinanceBasicsDebug = asyncHandler(async (req, res) => {
  try {
    console.log('🔍 Debug: Fetching ALL finance basics content (no filters)...');
    
    // Get all content without any filters
    const allContent = await mongoose.model('FinanceBasics').find({});
    
    console.log(`📋 Debug: Found ${allContent.length} total content items`);
    
    // Log each item for debugging
    allContent.forEach((item, index) => {
      console.log(`📝 Item ${index + 1}:`, {
        id: item._id,
        title: item.title,
        isPublished: item.isPublished,
        createdAt: item.createdAt
      });
    });

    res.json({
      success: true,
      message: 'Debug: All finance basics content retrieved',
      totalCount: allContent.length,
      data: allContent
    });
  } catch (error) {
    console.error('❌ Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Debug endpoint failed',
      details: error.message
    });
  }
});

// ===== SIP LEARNING MODULE =====

// Create SIP learning content
const createSIPLearning = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = []
  } = req.body;

  // Validate required fields
  if (!title || !description || !content || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, content, and video URL are required'
    });
  }

  // Create SIP learning content
  const createdContent = await mongoose.model('SIPLearning').create({
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    createdBy: req.user._id,
    views: 0
  });



  res.status(201).json({
    success: true,
    message: 'SIP learning content created successfully',
    data: createdContent
  });
});

// Get all SIP learning content
const getSIPLearning = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty } = req.query;



  // Build query
  const query = {};
  
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

res.json({
  success: true,
  data: responseData
});
});

// ===== MUTUAL FUNDS MODULE =====

// Create mutual funds content
const createMutualFunds = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = []
  } = req.body;

  // Validate required fields
  if (!title || !description || !content || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, content, and video URL are required'
    });
  }

  // Create mutual funds content
  const createdContent = await mongoose.model('MutualFunds').create({
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    createdBy: req.user._id,
    views: 0
  });



  res.status(201).json({
    success: true,
    message: 'Mutual funds content created successfully',
    data: createdContent
  });
});

// Get all mutual funds content
const getMutualFunds = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty } = req.query;



  // Build query
  const query = {};
  
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

  res.json({
    success: true,
    data: responseData
  });
});

// ===== FRAUD AWARENESS MODULE =====

// Create fraud awareness content
const createFraudAwareness = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = []
  } = req.body;

  // Validate required fields
  if (!title || !description || !content || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, content, and video URL are required'
    });
  }

  // Create fraud awareness content
  const createdContent = await mongoose.model('FraudAwareness').create({
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    createdBy: req.user._id,
    views: 0
  });



  res.status(201).json({
    success: true,
    message: 'Fraud awareness content created successfully',
    data: createdContent
  });
});

// Get all fraud awareness content
const getFraudAwareness = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty } = req.query;



  // Build query
  const query = {};
  
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

  res.json({
    success: true,
    data: responseData
  });
});

// ===== TAX PLANNING MODULE =====

// Create tax planning content
const createTaxPlanning = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle,
    videoDescription,
    difficulty = 'beginner',
    estimatedTime,
    tags = [],
    prerequisites = [],
    learningObjectives = []
  } = req.body;

  // Validate required fields
  if (!title || !description || !content || !videoUrl) {
    return res.status(400).json({
      success: false,
      error: 'Title, description, content, and video URL are required'
    });
  }

  // Create tax planning content
  const createdContent = await mongoose.model('TaxPlanning').create({
    title,
    description,
    content,
    detailedContent,
    videoUrl,
    videoTitle: videoTitle || title,
    videoDescription: videoDescription || description,
    difficulty,
    estimatedTime,
    tags,
    prerequisites,
    learningObjectives,
    createdBy: req.user._id,
    views: 0
  });



  res.status(201).json({
    success: true,
    message: 'Tax planning content created successfully',
    data: createdContent
  });
});

// Get all tax planning content
const getTaxPlanning = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, difficulty } = req.query;



  // Build query
  const query = {};
  
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

  res.json({
    success: true,
    data: responseData
  });
});

module.exports = {
  // Finance Basics
  createFinanceBasics,
  getFinanceBasics,
  getAllFinanceBasicsDebug,
  
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
