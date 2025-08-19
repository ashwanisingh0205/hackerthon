const express = require('express');
const router = express.Router();
const { 
  addPoints, 
  getUserPoints, 
  getAllPoints, 
  getPointsSummary,
  updatePoints,
  deletePoints
} = require('../controllers/pointsController');
const { authenticateUserOrAdmin } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Points:
 *       type: object
 *       required:
 *         - userId
 *         - points
 *         - description
 *         - action
 *       properties:
 *         userId:
 *           type: string
 *           description: User ID who earned the points
 *         points:
 *           type: number
 *           description: Number of points earned
 *           minimum: 1
 *         description:
 *           type: string
 *           description: Description of how points were earned
 *           maxLength: 500
 *         category:
 *           type: string
 *           enum: [quiz, upload, login, referral, achievement, other]
 *           description: Category of points
 *           default: other
 *         action:
 *           type: string
 *           description: Action that earned the points
 *           maxLength: 100
 *         metadata:
 *           type: object
 *           description: Additional data related to points
 *         isActive:
 *           type: boolean
 *           description: Whether the points record is active
 *           default: true
 */

/**
 * @swagger
 * /api/points:
 *   post:
 *     summary: Add points for a user
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - points
 *               - description
 *               - action
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               points:
 *                 type: number
 *                 example: 100
 *               description:
 *                 type: string
 *                 example: "Completed JavaScript quiz with 90% score"
 *               category:
 *                 type: string
 *                 enum: [quiz, upload, login, referral, achievement, other]
 *                 example: "quiz"
 *               action:
 *                 type: string
 *                 example: "quiz_completion"
 *               metadata:
 *                 type: object
 *                 example: { "quizId": "123", "score": 90, "totalQuestions": 10 }
 *     responses:
 *       201:
 *         description: Points added successfully
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
 *                   example: "Points added successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Points'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/points/user/{userId}:
 *   get:
 *     summary: Get all points for a specific user
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get points for
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
 *         name: category
 *         schema:
 *           type: string
 *           enum: [quiz, upload, login, referral, achievement, other]
 *         description: Filter by points category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: User points retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     points:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Points'
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPoints:
 *                           type: number
 *                         totalRecords:
 *                           type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalPoints:
 *                           type: number
 *                         hasNextPage:
 *                           type: boolean
 *                         hasPrevPage:
 *                           type: boolean
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/points:
 *   get:
 *     summary: Get all points (admin function)
 *     tags: [Points]
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
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *     responses:
 *       200:
 *         description: All points retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 */

/**
 * @swagger
 * /api/points/summary/{userId}:
 *   get:
 *     summary: Get points summary for a user
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get summary for
 *     responses:
 *       200:
 *         description: Points summary retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/points/{id}:
 *   put:
 *     summary: Update points record
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Points record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Points'
 *     responses:
 *       200:
 *         description: Points updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Points record not found
 *   delete:
 *     summary: Delete points record (soft delete)
 *     tags: [Points]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Points record ID
 *     responses:
 *       200:
 *         description: Points record deleted successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Points record not found
 */

// @route   POST /api/points
router.post('/', authenticateUserOrAdmin, addPoints);

// @route   GET /api/points/user/:userId
router.get('/user/:userId', authenticateUserOrAdmin, getUserPoints);

// @route   GET /api/points
router.get('/', authenticateUserOrAdmin, getAllPoints);

// @route   GET /api/points/summary/:userId
router.get('/summary/:userId', authenticateUserOrAdmin, getPointsSummary);

// @route   PUT /api/points/:id
router.put('/:id', authenticateUserOrAdmin, updatePoints);

// @route   DELETE /api/points/:id
router.delete('/:id', authenticateUserOrAdmin, deletePoints);

module.exports = router;
