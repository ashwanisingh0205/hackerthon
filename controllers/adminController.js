const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/config');

// Admin login
const adminLogin = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username, isActive: true });
    if (!admin) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or account inactive'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const payload = {
      adminId: admin._id,
      username: admin.username,
      role: admin.role,
      permissions: admin.permissions
    };

    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn || '15m'
    });

    // Get admin profile without password
    const adminProfile = admin.getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: adminProfile,
        accessToken,
        tokenType: 'Bearer',
        expiresIn: config.jwtExpiresIn || '15m'
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to authenticate admin',
      details: error.message
    });
  }
});

// Get admin profile
const getAdminProfile = asyncHandler(async (req, res) => {
  try {
    const adminId = req.admin.adminId;
    
    const admin = await Admin.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: admin
    });

  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve admin profile',
      details: error.message
    });
  }
});

// Create new admin (super admin only)
const createAdmin = asyncHandler(async (req, res) => {
  try {
    const { username, password, fullName, email, role, permissions } = req.body;

    // Check if current admin has permission to create other admins
    if (!req.admin.permissions.includes('manage_admins')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create admin accounts'
      });
    }

    // Validate required fields
    if (!username || !password || !fullName || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, full name, and email are required'
      });
    }

    // Check if username or email already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }]
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    // Create new admin
    const newAdmin = await Admin.create({
      username,
      password,
      fullName,
      email,
      role: role || 'admin',
      permissions: permissions || ['manage_content']
    });

    // Get admin profile without password
    const adminProfile = newAdmin.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      data: adminProfile
    });

  } catch (error) {
    console.error('❌ Create admin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create admin account',
      details: error.message
    });
  }
});

// Get all admins (super admin only)
const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    // Check if current admin has permission to view other admins
    if (!req.admin.permissions.includes('manage_admins')) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to view admin accounts'
      });
    }

    const admins = await Admin.find({}).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Admins retrieved successfully',
      data: admins
    });

  } catch (error) {
    console.error('❌ Get all admins error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve admins',
      details: error.message
    });
  }
});

module.exports = {
  adminLogin,
  getAdminProfile,
  createAdmin,
  getAllAdmins
};
