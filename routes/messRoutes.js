const express = require('express');
const router = express.Router();
const { auth, requireMess, requireMessAdmin } = require('../middleware/auth');
const {
  createMess,
  searchMess,
  joinMess,
  leaveMess,
  getMessDetails,
  removeMember,
  getPendingRequests,
  acceptMemberRequest,
  rejectMemberRequest,
  checkRequestStatus,
  cancelJoinRequest,
  validateEmailForInvitation,
} = require('../controllers/messController');

/**
 * @swagger
 * /api/mess/validate-email:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Validate email for mess invitation
 *     description: Check if an email is valid for mess invitation (user exists, not in another mess, no pending requests)
 *     security:
 *       - bearerAuth: []
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
 *                 description: Email to validate
 *     responses:
 *       200:
 *         description: Email validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 isValid:
 *                   type: boolean
 *                 reason:
 *                   type: string
 *                   description: Reason if email is not valid
 *                 user:
 *                   type: object
 *                   description: User details if email is valid
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     fullName:
 *                       type: string
 *       400:
 *         description: Email is required
 */
router.post('/validate-email', auth, validateEmailForInvitation);

/**
 * @swagger
 * /api/mess:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Create a new mess with members and fixed costs
 *     description: Create a new mess with invited members and fixed costs in a single API call
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
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the mess
 *               address:
 *                 type: string
 *                 description: Address of the mess
 *               members:
 *                 type: array
 *                 description: Array of member emails to invite
 *                 items:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: Member email address
 *               fixedCosts:
 *                 type: array
 *                 description: Array of fixed costs to add
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the fixed cost
 *                     amount:
 *                       type: number
 *                       description: Amount of the fixed cost
 *                     type:
 *                       type: string
 *                       enum: [houseRent, maidBill, wifiBill, electricityBill, gasBill, waterBill, cleaningBill, other]
 *                       description: Type of fixed cost (optional, defaults to 'other')
 *                     description:
 *                       type: string
 *                       description: Optional description
 *     responses:
 *       201:
 *         description: Mess created successfully with invited members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 mess:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     identifierCode:
 *                       type: string
 *                     admin:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                     memberCount:
 *                       type: number
 *                     fixedCosts:
 *                       type: array
 *                       items:
 *                         type: object
 *       400:
 *         description: Validation error (user already in mess, invalid members, etc.)
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, createMess);

/**
 * @swagger
 * /api/mess/search/{code}:
 *   get:
 *     tags:
 *       - Mess
 *     summary: Search mess by identifier code
 *     description: Find a mess using its 6-digit identifier code
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: 6-digit mess identifier code
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mess found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mess:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     identifierCode:
 *                       type: string
 *                     admin:
 *                       type: object
 *       404:
 *         description: Mess not found
 *       401:
 *         description: Unauthorized
 */
router.get('/search/:code', auth, searchMess);

/**
 * @swagger
 * /api/mess/join:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Request to join a mess
 *     description: Send a join request to an existing mess using its ID. The request will be pending until approved by the mess admin.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messId
 *             properties:
 *               messId:
 *                 type: string
 *                 description: ID of the mess to join
 *     responses:
 *       200:
 *         description: Join request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Join request sent successfully. Please wait for admin approval.
 *                 mess:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     identifierCode:
 *                       type: string
 *       400:
 *         description: User is already part of a mess, already a member, or already has a pending request
 *       404:
 *         description: Mess not found
 *       401:
 *         description: Unauthorized
 */
router.post('/join', auth, joinMess);

/**
 * @swagger
 * /api/mess/leave:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Leave current mess
 *     description: Leave the current mess (admin cannot leave without transferring admin role)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully left the mess
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: User is not part of any mess or admin cannot leave
 *       401:
 *         description: Unauthorized
 */
router.post('/leave', auth, requireMess, leaveMess);

/**
 * @swagger
 * /api/mess:
 *   get:
 *     tags:
 *       - Mess
 *     summary: Get mess details
 *     description: Get details of the current mess including members
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mess details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mess:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     address:
 *                       type: string
 *                     identifierCode:
 *                       type: string
 *                     admin:
 *                       type: object
 *                     members:
 *                       type: array
 *                       items:
 *                         type: object
 *                     memberCount:
 *                       type: number
 *       400:
 *         description: User is not part of any mess
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, requireMess, getMessDetails);

/**
 * @swagger
 * /api/mess/members/{memberId}:
 *   delete:
 *     tags:
 *       - Mess
 *     summary: Remove member from mess (admin only)
 *     description: Remove a member from the mess (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         description: ID of the member to remove
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot remove mess admin
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Mess admin required
 */
router.delete('/members/:memberId', auth, requireMess, requireMessAdmin, removeMember);

/**
 * @swagger
 * /api/mess/pending-requests:
 *   get:
 *     tags:
 *       - Mess
 *     summary: Get pending join requests (admin only)
 *     description: Get all pending member join requests for the mess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pendingRequests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Request ID
 *                       user:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                         enum: [pending]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Mess admin required
 */
router.get('/pending-requests', auth, requireMess, requireMessAdmin, getPendingRequests);

/**
 * @swagger
 * /api/mess/accept-request:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Accept member request (admin only)
 *     description: Accept a pending member join request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the pending request to accept
 *     responses:
 *       200:
 *         description: Member request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: User is already a member or invalid request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Mess admin required
 *       404:
 *         description: Request not found or already processed
 */
router.post('/accept-request', auth, requireMess, requireMessAdmin, acceptMemberRequest);

/**
 * @swagger
 * /api/mess/reject-request:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Reject member request (admin only)
 *     description: Reject a pending member join request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestId
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the pending request to reject
 *     responses:
 *       200:
 *         description: Member request rejected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied - Mess admin required
 *       404:
 *         description: Request not found or already processed
 */
router.post('/reject-request', auth, requireMess, requireMessAdmin, rejectMemberRequest);

/**
 * @swagger
 * /api/mess/check-request-status:
 *   get:
 *     tags:
 *       - Mess
 *     summary: Check join request status (real-time)
 *     description: Check the status of user's join request for real-time updates
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Request status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [accepted]
 *                       description: Request was accepted
 *                     message:
 *                       type: string
 *                     mess:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                         identifierCode:
 *                           type: string
 *                         admin:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             fullName:
 *                               type: string
 *                             email:
 *                               type: string
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [pending]
 *                       description: Request is still pending
 *                     message:
 *                       type: string
 *                     mess:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                         identifierCode:
 *                           type: string
 *                         admin:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             fullName:
 *                               type: string
 *                             email:
 *                               type: string
 *                     request:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         requestedAt:
 *                           type: string
 *                           format: date-time
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [rejected]
 *                       description: Request was rejected
 *                     message:
 *                       type: string
 *                     mess:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         identifierCode:
 *                           type: string
 *                         admin:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             fullName:
 *                               type: string
 *                             email:
 *                               type: string
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [none]
 *                       description: No request found
 *                     message:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/check-request-status', auth, checkRequestStatus);

/**
 * @swagger
 * /api/mess/cancel-request:
 *   post:
 *     tags:
 *       - Mess
 *     summary: Cancel join request
 *     description: Cancel a pending join request
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Join request cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Join request cancelled successfully
 *                 status:
 *                   type: string
 *                   enum: [cancelled]
 *       400:
 *         description: User is already a member of a mess
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No pending request found
 */
router.post('/cancel-request', auth, cancelJoinRequest);

module.exports = router; 