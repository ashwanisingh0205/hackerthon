const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  refreshToken, 
  logoutUser, 
  getCurrentUser 
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: "development"
 */

// @route   POST /api/auth/signup
router.post('/signup', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   POST /api/auth/refresh
router.post('/refresh', refreshToken);

// @route   POST /api/auth/logout
router.post('/logout', logoutUser);

// @route   GET /api/auth/me
router.get('/me', authenticate, getCurrentUser);

module.exports = router; 