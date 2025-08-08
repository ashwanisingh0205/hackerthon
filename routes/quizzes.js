const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getQuizzes, 
  getQuiz, 
  getQuizWithAnswers, 
  updateQuiz, 
  deleteQuiz, 
  submitQuiz 
} = require('../controllers/quizController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/quizzes:
 *   post:
 *     summary: Create a new quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['title', 'questions']
 *             properties:
 *               title:
 *                 type: string
 *                 description: Quiz title
 *               description:
 *                 type: string
 *                 description: Quiz description
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: ['question', 'options', 'correctAnswer']
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: Question text
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Answer options
 *                     correctAnswer:
 *                       type: integer
 *                       description: Index of correct answer (0-based)
 *                     explanation:
 *                       type: string
 *                       description: Explanation for the answer
 *               timeLimit:
 *                 type: integer
 *                 description: Time limit in minutes (0 for no limit)
 *               passingScore:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Minimum score to pass (percentage)
 *               category:
 *                 type: string
 *                 description: Quiz category
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               isPublic:
 *                 type: boolean
 *                 description: Whether quiz is public
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/quizzes:
 *   get:
 *     summary: Get all quizzes
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of quizzes per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Comma-separated tags
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public status
 *     responses:
 *       200:
 *         description: Quizzes retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/quizzes/{id}:
 *   get:
 *     summary: Get a single quiz (for taking)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully (without correct answers)
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/quizzes/{id}/answers:
 *   get:
 *     summary: Get quiz with answers (for creator/admin)
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz retrieved successfully (with correct answers)
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/quizzes/{id}/submit:
 *   post:
 *     summary: Submit quiz answers
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['answers']
 *             properties:
 *               answers:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of answer indices (0-based)
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
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
 *                     score:
 *                       type: integer
 *                       example: 85
 *                     correctAnswers:
 *                       type: integer
 *                       example: 17
 *                     totalQuestions:
 *                       type: integer
 *                       example: 20
 *                     passed:
 *                       type: boolean
 *                       example: true
 *                     passingScore:
 *                       type: integer
 *                       example: 70
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           question:
 *                             type: string
 *                           userAnswer:
 *                             type: string
 *                           correctAnswer:
 *                             type: string
 *                           isCorrect:
 *                             type: boolean
 *                           explanation:
 *                             type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/quizzes/{id}:
 *   put:
 *     summary: Update quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Quiz title
 *               description:
 *                 type: string
 *                 description: Quiz description
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question:
 *                       type: string
 *                       description: Question text
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Answer options
 *                     correctAnswer:
 *                       type: integer
 *                       description: Index of correct answer (0-based)
 *                     explanation:
 *                       type: string
 *                       description: Explanation for the answer
 *               timeLimit:
 *                 type: integer
 *                 description: Time limit in minutes
 *               passingScore:
 *                 type: integer
 *                 description: Minimum score to pass (percentage)
 *               category:
 *                 type: string
 *                 description: Quiz category
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               isPublic:
 *                 type: boolean
 *                 description: Whether quiz is public
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/quizzes/{id}:
 *   delete:
 *     summary: Delete a quiz
 *     tags: [Quizzes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz deleted successfully
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   POST /api/quizzes
router.post('/', authenticate, createQuiz);

// @route   GET /api/quizzes
router.get('/', authenticate, getQuizzes);

// @route   GET /api/quizzes/:id
router.get('/:id', authenticate, getQuiz);

// @route   GET /api/quizzes/:id/answers
router.get('/:id/answers', authenticate, getQuizWithAnswers);

// @route   POST /api/quizzes/:id/submit
router.post('/:id/submit', authenticate, submitQuiz);

// @route   PUT /api/quizzes/:id
router.put('/:id', authenticate, updateQuiz);

// @route   DELETE /api/quizzes/:id
router.delete('/:id', authenticate, deleteQuiz);

module.exports = router;
