const express = require('express');
const router = express.Router();
const { adminLogin, getAdminProfile, createAdmin, getAllAdmins } = require('../controllers/adminController');
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

module.exports = router;
