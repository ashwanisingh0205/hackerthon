const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/financialLearningController');
const { authenticateUserOrAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     FinancialLearningContent:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - videoUrl
 *       properties:
 *         title:
 *           type: string
 *           description: Content title
 *           maxLength: 200
 *           example: "Understanding Compound Interest"
 *         description:
 *           type: string
 *           description: Content description
 *           maxLength: 1000
 *           example: "Learn how compound interest works and why it's important for wealth building"
 *         videoUrl:
 *           type: string
 *           description: Video URL
 *           example: "https://example.com/video.mp4"
 *         videoTitle:
 *           type: string
 *           description: Video title
 *           maxLength: 200
 *           example: "Compound Interest Explained"
 *         videoDescription:
 *           type: string
 *           description: Video description
 *           maxLength: 500
 *           example: "A comprehensive guide to compound interest"
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           default: beginner
 *           example: "beginner"
 *         estimatedTime:
 *           type: number
 *           description: Estimated time to complete in minutes
 *           minimum: 1
 *           example: 45
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Content tags
 *           example: ["compound-interest", "saving", "investing"]
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           description: Prerequisites for this content
 *           example: ["Basic math", "Understanding of simple interest"]
 *         learningObjectives:
 *           type: array
 *           items:
 *             type: string
 *           description: Learning objectives
 *           example: ["Calculate compound interest", "Understand time value of money"]
 *         isPublished:
 *           type: boolean
 *           description: Whether content is published
 *           default: false
 *           example: false
 */

// ===== FINANCE BASICS ROUTES =====

/**
 * @swagger
 * /api/financial/finance-basics:
 *   post:
 *     summary: Create new finance basics content
 *     tags: [Finance Basics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialLearningContent'
 *     responses:
 *       201:
 *         description: Finance basics content created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all finance basics content
 *     tags: [Finance Basics]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: Finance basics content retrieved successfully
 */

// @route   POST /api/financial/finance-basics
router.post('/finance-basics', authenticateUserOrAdmin, createFinanceBasics);

// @route   GET /api/financial/finance-basics
router.get('/finance-basics', getFinanceBasics);

// @route   GET /api/financial/finance-basics/debug (for troubleshooting)
router.get('/finance-basics/debug', getAllFinanceBasicsDebug);

// ===== SIP LEARNING ROUTES =====

/**
 * @swagger
 * /api/financial/sip-learning:
 *   post:
 *     summary: Create new SIP learning content
 *     tags: [SIP Learning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialLearningContent'
 *     responses:
 *       201:
 *         description: SIP learning content created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all SIP learning content
 *     tags: [SIP Learning]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: SIP learning content retrieved successfully
 */

// @route   POST /api/financial/sip-learning
router.post('/sip-learning', authenticateUserOrAdmin, createSIPLearning);

// @route   GET /api/financial/sip-learning
router.get('/sip-learning', getSIPLearning);

// ===== MUTUAL FUNDS ROUTES =====

/**
 * @swagger
 * /api/financial/mutual-funds:
 *   post:
 *     summary: Create new mutual funds content
 *     tags: [Mutual Funds]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialLearningContent'
 *     responses:
 *       201:
 *         description: Mutual funds content created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all mutual funds content
 *     tags: [Mutual Funds]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: Mutual funds content retrieved successfully
 */

// @route   POST /api/financial/mutual-funds
router.post('/mutual-funds', authenticateUserOrAdmin, createMutualFunds);

// @route   GET /api/financial/mutual-funds
router.get('/mutual-funds', getMutualFunds);

// ===== FRAUD AWARENESS ROUTES =====

/**
 * @swagger
 * /api/financial/fraud-awareness:
 *   post:
 *     summary: Create new fraud awareness content
 *     tags: [Fraud Awareness]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialLearningContent'
 *     responses:
 *       201:
 *         description: Fraud awareness content created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all fraud awareness content
 *     tags: [Fraud Awareness]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: Fraud awareness content retrieved successfully
 */

// @route   POST /api/financial/fraud-awareness
router.post('/fraud-awareness', authenticateUserOrAdmin, createFraudAwareness);

// @route   GET /api/financial/fraud-awareness
router.get('/fraud-awareness', getFraudAwareness);

// ===== TAX PLANNING ROUTES =====

/**
 * @swagger
 * /api/financial/tax-planning:
 *   post:
 *     summary: Create new tax planning content
 *     tags: [Tax Planning]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FinancialLearningContent'
 *     responses:
 *       201:
 *         description: Tax planning content created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all tax planning content
 *     tags: [Tax Planning]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: Tax planning content retrieved successfully
 */

// @route   POST /api/financial/tax-planning
router.post('/tax-planning', authenticateUserOrAdmin, createTaxPlanning);

// @route   GET /api/financial/tax-planning
router.get('/tax-planning', getTaxPlanning);

module.exports = router;
