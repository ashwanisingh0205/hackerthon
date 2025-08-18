const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile, createAdmin, getAllAdmins, getAllUsers, toggleUserBlock, deleteUser } = require('../controllers/adminController');
const { authenticateAdmin, requirePermission } = require('../middleware/adminAuth');

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login with username and password
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginRequest'
 *     responses:
 *       200:
 *         description: Admin login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', adminLogin);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get admin profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProfileResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticateAdmin, getAdminProfile);

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create new admin account (super admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdminRequest'
 *     responses:
 *       201:
 *         description: Admin account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminProfileResponse'
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.post('/create', authenticateAdmin, requirePermission('manage_admins'), createAdmin);

/**
 * @swagger
 * /api/admin/all:
 *   get:
 *     summary: Get all admin accounts (super admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllAdminsResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/all', authenticateAdmin, requirePermission('manage_admins'), getAllAdmins);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all registered users (admin only)
 *     tags: [Admin]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for filtering users by name or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AllUsersResponse'
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/users', authenticateAdmin, requirePermission('manage_users'), getAllUsers);

/**
 * @swagger
 * /api/admin/users/{userId}/block:
 *   patch:
 *     summary: Block or unblock a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to block/unblock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [block, unblock]
 *                 description: Action to perform
 *               reason:
 *                 type: string
 *                 description: Reason for blocking (optional)
 *     responses:
 *       200:
 *         description: User block status updated successfully
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
 *                   example: User blocked successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     isBlocked:
 *                       type: boolean
 *                     blockedAt:
 *                       type: string
 *                       format: date-time
 *                     blockReason:
 *                       type: string
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch('/users/:userId/block', authenticateAdmin, requirePermission('manage_users'), toggleUserBlock);

/**
 * @swagger
 * /api/admin/users/{userId}/delete:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to delete
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for deletion (optional)
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                     deleteReason:
 *                       type: string
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete('/users/:userId/delete', authenticateAdmin, requirePermission('manage_users'), deleteUser);

module.exports = router;
