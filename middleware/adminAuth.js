const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/config');

const authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided or invalid format.'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret);
      
      // Check if admin still exists and is active
      const admin = await Admin.findById(decoded.adminId).select('-password');
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Token is invalid or admin account is inactive.'
        });
      }

      // Add admin info to request
      req.admin = {
        adminId: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired. Please login again.'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please login again.'
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Token verification failed.'
        });
      }
    }
  } catch (error) {
    console.error('❌ Admin authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.'
    });
  }
};

// Middleware to check specific permissions
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required: ${permission}`
      });
    }
    next();
  };
};

// Middleware to check admin role
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.admin || req.admin.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Insufficient role. Required: ${role}`
      });
    }
    next();
  };
};

module.exports = {
  authenticateAdmin,
  requirePermission,
  requireRole
};
