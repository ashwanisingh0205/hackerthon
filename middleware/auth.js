const { verifyAccessToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to authenticate user using access token
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access token is required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = verifyAccessToken(token);
    
    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired access token'
    });
  }
});

module.exports = {
  authenticate
}; 