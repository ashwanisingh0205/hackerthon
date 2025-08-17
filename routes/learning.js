const express = require('express');
const router = express.Router();
const { 
  // Content functions
  createContent, 
  getContentByCategory, 
  getContentById, 
  addVideoToContent,
  removeVideoFromContent,
  getAllContent, 
  updateContent, 
  deleteContent, 
  getLearningStats
} = require('../controllers/learningController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     LearningCategory:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Category name
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: Category description
 *           maxLength: 500
 *         icon:
 *           type: string
 *           description: Category icon emoji
 *           example: "💰"
 *         color:
 *           type: string
 *           description: Category color hex code
 *           example: "#3B82F6"
 *         sortOrder:
 *           type: number
 *           description: Sort order for display
 *           default: 0
 *         isActive:
 *           type: boolean
 *           description: Whether category is active
 *           default: true
 *     LearningContent:
 *       type: object
 *       required:
 *         - title
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           description: Content title
 *           maxLength: 200
 *         description:
 *           type: string
 *           description: Content description
 *           maxLength: 1000
 *         category:
 *           type: string
 *           description: Learning category ID
 *         difficulty:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           default: beginner
 *         estimatedTime:
 *           type: number
 *           description: Estimated time to complete in minutes
 *           minimum: 1
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Content tags
 *         prerequisites:
 *           type: array
 *           items:
 *             type: string
 *           description: Prerequisites for this content
 *         learningObjectives:
 *           type: array
 *           items:
 *             type: string
 *           description: Learning objectives
 *         resources:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [pdf, link, document, other]
 *               url:
 *                 type: string
 *               description:
 *                 type: string
 *         isPublished:
 *           type: boolean
 *           description: Whether content is published
 *           default: false
 *         isPublic:
 *           type: boolean
 *           description: Whether content is public
 *           default: true
 *     ContentVideo:
 *       type: object
 *       required:
 *         - videoId
 *         - title
 *       properties:
 *         videoId:
 *           type: string
 *           description: Video ID to add to content
 *         title:
 *           type: string
 *           description: Title for the video in this content
 *         description:
 *           type: string
 *           description: Description for the video in this content
 *         order:
 *           type: number
 *           description: Display order of the video
 */

// ===== LEARNING CATEGORIES =====

/**
 * @swagger
 * /api/learning/categories:
 *   post:
 *     summary: Create a new learning category
 *     tags: [Learning Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Finance Basics"
 *               description:
 *                 type: string
 *                 example: "Fundamental concepts of personal finance"
 *               icon:
 *                 type: string
 *                 example: "💰"
 *               color:
 *                 type: string
 *                 example: "#10B981"
 *               sortOrder:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Learning category created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all learning categories
 *     tags: [Learning Categories]
 *     parameters:
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */

/**
 * @swagger
 * /api/learning/categories/{id}:
 *   put:
 *     summary: Update a learning category
 *     tags: [Learning Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 description: Category name
 *               slug:
 *                 type: string
 *                 description: Category slug
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Category not found
 */

// ===== LEARNING CONTENT =====

/**
 * @swagger
 * /api/learning/content:
 *   post:
 *     summary: Create new learning content
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - categorySlug
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Understanding Compound Interest"
 *               description:
 *                 type: string
 *                 example: "Learn how compound interest works and why it's important for wealth building"
 *               categorySlug:
 *                 type: string
 *                 example: "finance"
 *                 description: Category slug (e.g., "finance", "programming")
 *               category:
 *                 type: object
 *                 description: Alternative format for backward compatibility
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Category ID (legacy)
 *                   slug:
 *                     type: string
 *                     description: Category slug
 *                     example: "finance"
 *               difficulty:
 *                 type: string
 *                 example: "beginner"
 *               estimatedTime:
 *                 type: number
 *                 example: 45
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["compound interest", "saving", "investing"]
 *               prerequisites:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Basic math", "Understanding of simple interest"]
 *               learningObjectives:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Calculate compound interest", "Understand time value of money"]
 *               resources:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                       example: "Compound Interest Calculator"
 *                     type:
 *                       type: string
 *                       example: "link"
 *                     url:
 *                       type: string
 *                       example: "https://example.com/calculator"
 *                     description:
 *                       type: string
 *                       example: "Interactive calculator to practice"
 *     responses:
 *       201:
 *         description: Learning content created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Learning category not found
 *   get:
 *     summary: Get all learning content (admin/creator view)
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Filter by published status
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator ID
 *     responses:
 *       200:
 *         description: Learning content retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 */

/**
 * @swagger
 * /api/learning/content/category/{categorySlug}:
 *   get:
 *     summary: Get learning content by category slug
 *     tags: [Learning Content]
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug (e.g., finance-basics, sip-learning)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *         description: Filter by difficulty level
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by published status
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       404:
 *         description: Learning category not found
 */

/**
 * @swagger
 * /api/learning/content/{id}:
 *   get:
 *     summary: Get specific learning content by ID
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Access denied to this content
 *       404:
 *         description: Learning content not found
 *   put:
 *     summary: Update learning content
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LearningContent'
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only update your own content
 *       404:
 *         description: Learning content not found
 *   delete:
 *     summary: Delete learning content
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only delete your own content
 *       404:
 *         description: Learning content not found
 */

/**
 * @swagger
 * /api/learning/content/{id}/videos:
 *   post:
 *     summary: Add a video to learning content
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContentVideo'
 *     responses:
 *       200:
 *         description: Video added to content successfully
 *       400:
 *         description: Bad request - validation error or video already exists
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only add videos to your own content
 *       404:
 *         description: Content or video not found
 */

/**
 * @swagger
 * /api/learning/content/{id}/videos/{videoId}:
 *   delete:
 *     summary: Remove a video from learning content
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to remove
 *     responses:
 *       200:
 *         description: Video removed from content successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only modify your own content
 *       404:
 *         description: Content or video not found
 */

/**
 * @swagger
 * /api/learning/stats:
 *   get:
 *     summary: Get learning dashboard statistics
 *     tags: [Learning Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Learning statistics retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 */



// ===== LEARNING CONTENT =====

// @route   POST /api/learning/content
router.post('/content', authenticate, createContent);

// @route   GET /api/learning/content
router.get('/content', authenticate, getAllContent);

// @route   GET /api/learning/content/category/:categorySlug
router.get('/content/category/:categorySlug', getContentByCategory);

// @route   GET /api/learning/content/:id
router.get('/content/:id', authenticate, getContentById);

// @route   PUT /api/learning/content/:id
router.put('/content/:id', authenticate, updateContent);

// @route   DELETE /api/learning/content/:id
router.delete('/content/:id', authenticate, deleteContent);

// @route   POST /api/learning/content/:id/videos
router.post('/content/:id/videos', authenticate, addVideoToContent);

// @route   DELETE /api/learning/content/:id/videos/:videoId
router.delete('/content/:id/videos/:videoId', authenticate, removeVideoFromContent);

// @route   GET /api/learning/stats
router.get('/stats', authenticate, getLearningStats);

module.exports = router;
