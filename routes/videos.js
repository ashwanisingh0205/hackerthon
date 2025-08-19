const express = require('express');
const router = express.Router();
const { 
  uploadVideo, 
  getVideos, 
  getVideo, 
  updateVideo, 
  deleteVideo, 
  getVideoStream 
} = require('../controllers/videoController');
const { authenticateUserOrAdmin } = require('../middleware/auth');
const { uploadVideo: uploadVideoMiddleware } = require('../config/cloudinary');

/**
 * @swagger
 * /api/videos/upload:
 *   post:
 *     summary: Upload a video to Cloudinary
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Video file to upload
 *               title:
 *                 type: string
 *                 description: Video title
 *               description:
 *                 type: string
 *                 description: Video description
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               isPublic:
 *                 type: boolean
 *                 description: Whether video is public
 *     responses:
 *       201:
 *         description: Video uploaded successfully
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
 *                   example: "Video uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     title:
 *                       type: string
 *                       example: "Sample Video"
 *                     cloudinaryUrl:
 *                       type: string
 *                       example: "https://res.cloudinary.com/example/video/upload/v123/sample.mp4"
 *                     duration:
 *                       type: number
 *                       example: 120
 *                     format:
 *                       type: string
 *                       example: "mp4"
 *                     size:
 *                       type: number
 *                       example: 10240000
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos
 *     tags: [Videos]
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
 *         description: Number of videos per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
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
 *         description: Videos retrieved successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get a single video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/videos/{id}/stream:
 *   get:
 *     summary: Get video streaming URL
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Streaming URL retrieved successfully
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update video metadata
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Video title
 *               description:
 *                 type: string
 *                 description: Video description
 *               tags:
 *                 type: string
 *                 description: Comma-separated tags
 *               isPublic:
 *                 type: boolean
 *                 description: Whether video is public
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// @route   POST /api/videos/upload
router.post('/upload', authenticateUserOrAdmin, uploadVideoMiddleware.single('video'), uploadVideo);

// @route   GET /api/videos
router.get('/', authenticateUserOrAdmin, getVideos);

// @route   GET /api/videos/:id
router.get('/:id', authenticateUserOrAdmin, getVideo);

// @route   GET /api/videos/:id/stream
router.get('/:id/stream', authenticateUserOrAdmin, getVideoStream);

// @route   PUT /api/videos/:id
router.put('/:id', authenticateUserOrAdmin, updateVideo);

// @route   DELETE /api/videos/:id
router.delete('/:id', authenticateUserOrAdmin, deleteVideo);

module.exports = router;
