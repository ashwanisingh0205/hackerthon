const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Generate access token
 * @param {Object} payload - Token payload
 * @returns {string} Access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: config.jwtAccessExpiresIn
  });
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiresIn
  });
};

/**
 * Verify access token
 * @param {string} token - Access token to verify
 * @returns {Object} Decoded token payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtAccessSecret);
  } catch (error) {
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens
}; 