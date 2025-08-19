const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Middleware to authenticate user using JWT token
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token is required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = verifyToken(token);
    
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
      error: 'Invalid or expired token'
    });
  }
});

/**
 * Middleware to authenticate either user or admin using JWT token
 * This allows admins to access all APIs with full privileges
 */
const authenticateUserOrAdmin = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Token is required'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // First try to verify as user token
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user) {
        req.user = user;
        req.isAdmin = false;
        return next();
      }
    } catch (userError) {
      // User token verification failed, try admin token
    }

    // Try to verify as admin token
    try {
      const jwt = require('jsonwebtoken');
      const config = require('../config/config');
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const admin = await Admin.findById(decoded.adminId).select('-password');
      
      if (admin && admin.isActive) {
        // Create a user-like object for admin to maintain compatibility
        req.user = {
          _id: admin._id,
          fullName: admin.fullName || admin.username,
          email: admin.email || admin.username,
          isAdmin: true,
          role: admin.role,
          permissions: admin.permissions
        };
        req.isAdmin = true;
        req.admin = admin;
        return next();
      }
    } catch (adminError) {
      // Admin token verification failed
    }

    // If we reach here, neither user nor admin token was valid
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
});

/**
 * Middleware to check if user is admin (for admin-only operations)
 */
const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
});

module.exports = {
  authenticate,
  authenticateUserOrAdmin,
  requireAdmin
}; 