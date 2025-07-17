const User = require('../models/User');
const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokens, verifyRefreshToken } = require('../utils/jwtUtils');
const config = require('../config/config');


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // Check if user exists
  const existingUser = await User.findOne({ 
    $or: [{ email }, { username }] 
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      id: user._id,
      username: user.username,
      email: user.email
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

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens({
    userId: user._id,
    email: user.email
  });

  // Save refresh token to database
  await user.addRefreshToken(refreshToken);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      accessToken,
      refreshToken
    }
  });
});



const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if refresh token exists in user's refresh tokens
    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    
    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens({
      userId: user._id,
      email: user.email
    });

    // Remove old refresh token and add new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(newRefreshToken);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});


const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and remove refresh token
    const user = await User.findById(decoded.userId);
    
    if (user) {
      await user.removeRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    // Even if token is invalid, return success to prevent token enumeration
    res.json({
      success: true,
      message: 'Logout successful'
    });
  }
});


const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  getCurrentUser
}; 