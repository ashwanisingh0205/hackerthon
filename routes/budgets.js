const express = require('express');
const router = express.Router();
const { 
  createBudget, 
  getUserBudgets, 
  getBudgetById, 
  addVideoToBudget,
  removeVideoFromBudget,
  updateBudget, 
  deleteBudget,
  getPublicBudgets,
  getBudgetStats
} = require('../controllers/budgetController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Budget:
 *       type: object
 *       required:
 *         - title
 *         - amount
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           description: Budget title
 *           maxLength: 200
 *         description:
 *           type: string
 *           description: Budget description
 *           maxLength: 1000
 *         amount:
 *           type: number
 *           description: Budget amount
 *           minimum: 0
 *         currency:
 *           type: string
 *           enum: [USD, EUR, GBP, INR, CAD, AUD]
 *           description: Currency for the budget
 *           default: USD
 *         category:
 *           type: string
 *           enum: [personal, business, education, entertainment, health, travel, other]
 *           description: Budget category
 *           default: personal
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled, on-hold]
 *           description: Budget status
 *           default: active
 *         startDate:
 *           type: string
 *           format: date
 *           description: Budget start date
 *         endDate:
 *           type: string
 *           format: date
 *           description: Budget end date
 *         isPublic:
 *           type: boolean
 *           description: Whether the budget is public
 *           default: false
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Budget tags
 *         metadata:
 *           type: object
 *           description: Additional budget data
 *     BudgetVideo:
 *       type: object
 *       required:
 *         - videoId
 *         - title
 *       properties:
 *         videoId:
 *           type: string
 *           description: Video ID to add to budget
 *         title:
 *           type: string
 *           description: Title for the video in this budget
 *         description:
 *           type: string
 *           description: Description for the video in this budget
 */

/**
 * @swagger
 * /api/budgets:
 *   post:
 *     summary: Create a new budget
 *     tags: [Budgets]
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
 *               - amount
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Summer Vacation 2024"
 *               description:
 *                 type: string
 *                 example: "Budget for summer vacation expenses"
 *               amount:
 *                 type: number
 *                 example: 5000
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               category:
 *                 type: string
 *                 example: "travel"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-08-31"
 *               isPublic:
 *                 type: boolean
 *                 example: false
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["vacation", "summer", "travel"]
 *     responses:
 *       201:
 *         description: Budget created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *   get:
 *     summary: Get all budgets for the authenticated user
 *     tags: [Budgets]
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
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by budget category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by budget status
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public status
 *     responses:
 *       200:
 *         description: User budgets retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 */

/**
 * @swagger
 * /api/budgets/public:
 *   get:
 *     summary: Get public budgets for discovery
 *     tags: [Budgets]
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
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by budget category
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator
 *     responses:
 *       200:
 *         description: Public budgets retrieved successfully
 */

/**
 * @swagger
 * /api/budgets/stats:
 *   get:
 *     summary: Get budget statistics for the authenticated user
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Budget statistics retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 */

/**
 * @swagger
 * /api/budgets/{id}:
 *   get:
 *     summary: Get a specific budget by ID
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget retrieved successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Access denied to this budget
 *       404:
 *         description: Budget not found
 *   put:
 *     summary: Update a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Budget'
 *     responses:
 *       200:
 *         description: Budget updated successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only update your own budgets
 *       404:
 *         description: Budget not found
 *   delete:
 *     summary: Delete a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     responses:
 *       200:
 *         description: Budget deleted successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only delete your own budgets
 *       404:
 *         description: Budget not found
 */

/**
 * @swagger
 * /api/budgets/{id}/videos:
 *   post:
 *     summary: Add a video to a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BudgetVideo'
 *     responses:
 *       200:
 *         description: Video added to budget successfully
 *       400:
 *         description: Bad request - validation error or video already exists
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only add videos to your own budgets
 *       404:
 *         description: Budget or video not found
 */

/**
 * @swagger
 * /api/budgets/{id}/videos/{videoId}:
 *   delete:
 *     summary: Remove a video from a budget
 *     tags: [Budgets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Budget ID
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID to remove
 *     responses:
 *       200:
 *         description: Video removed from budget successfully
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: You can only modify your own budgets
 *       404:
 *         description: Budget or video not found
 */

// @route   POST /api/budgets
router.post('/', authenticate, createBudget);

// @route   GET /api/budgets
router.get('/', authenticate, getUserBudgets);

// @route   GET /api/budgets/public
router.get('/public', getPublicBudgets);

// @route   GET /api/budgets/stats
router.get('/stats', authenticate, getBudgetStats);

// @route   GET /api/budgets/:id
router.get('/:id', authenticate, getBudgetById);

// @route   PUT /api/budgets/:id
router.put('/:id', authenticate, updateBudget);

// @route   DELETE /api/budgets/:id
router.delete('/:id', authenticate, deleteBudget);

// @route   POST /api/budgets/:id/videos
router.post('/:id/videos', authenticate, addVideoToBudget);

// @route   DELETE /api/budgets/:id/videos/:videoId
router.delete('/:id/videos/:videoId', authenticate, removeVideoFromBudget);

module.exports = router;
