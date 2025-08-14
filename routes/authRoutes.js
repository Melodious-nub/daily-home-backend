const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  getMe,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account with email verification. If user exists but is unverified, the old account will be replaced.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - fullName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *               fullName:
 *                 type: string
 *                 description: User's full name
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: User already exists or invalid data
 *       500:
 *         description: Server error
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Verify email with OTP
 *     description: Verify user's email address using the OTP sent to their email (OTP expires in 3 minutes)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - otp
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID received from signup
 *               otp:
 *                 type: string
 *                 description: 4-digit OTP code from email
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid or expired OTP
 *       404:
 *         description: User not found
 */
router.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Resend OTP
 *     description: Resend OTP to user's email address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 description: User ID received from signup
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Email already verified
 *       404:
 *         description: User not found
 */
router.post('/resend-otp', resendOTP);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: User login
 *     description: Authenticate user and return JWT token (no expiry)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid credentials or email not verified
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get current user profile and state
 *     description: Get authenticated user's profile information and current state for UI routing. Returns essential state information for frontend navigation.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile and state retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     isEmailVerified:
 *                       type: boolean
 *                 hasMess:
 *                   type: boolean
 *                   description: User is a member of a mess
 *                 isMessAdmin:
 *                   type: boolean
 *                   description: User is the admin of their mess
 *                 currentMess:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     identifierCode:
 *                       type: string
 *                 hasPendingRequest:
 *                   type: boolean
 *                   description: User has a pending join request (only if hasMess is false)
 *                 pendingRequestMess:
 *                   type: object
 *                   nullable: true
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     identifierCode:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid token
 *       404:
 *         description: User not found
 */
router.get('/me', auth, getMe);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset (send OTP)
 *     description: Send a one-time password (OTP) to the user's email for password reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: OTP has been sent to your email.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP has been sent to your email.
 *       400:
 *         description: Email is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email is required.
 *       404:
 *         description: User with this email not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with this email not found.
 *       500:
 *         description: Server error
 */
router.post('/request-password-reset', requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Reset password using OTP
 *     description: Reset the user's password using the OTP sent to their email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email
 *               newPassword:
 *                 type: string
 *                 description: The new password (min 6 characters)
 *     responses:
 *       200:
 *         description: Password reset successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid or expired OTP, missing fields, password too short, or new password same as current password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New password cannot be the same as your current password.
 *       500:
 *         description: Server error
 */
router.post('/reset-password', resetPassword);

module.exports = router; 