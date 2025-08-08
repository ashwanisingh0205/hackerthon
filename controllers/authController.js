const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/jwtUtils');
const config = require('../config/config');

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, mobileNumber, dateOfBirth, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Validate password for spaces
  if (/\s/.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password cannot contain spaces'
    });
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    mobileNumber,
    dateOfBirth,
    password
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      dateOfBirth: user.dateOfBirth
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Validate password for spaces
  if (/\s/.test(password)) {
    return res.status(400).json({
      success: false,
      error: 'Password cannot contain spaces'
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken({
    userId: user._id,
    email: user.email
  });

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        dateOfBirth: user.dateOfBirth
      },
      token
    }
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  // Since we're not storing tokens on the server, 
  // logout is handled client-side by removing the token
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      mobileNumber: req.user.mobileNumber,
      dateOfBirth: req.user.dateOfBirth
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
}; 