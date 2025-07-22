const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

/**
 * @swagger
 * /api/members:
 *   get:
 *     tags:
 *       - Members
 *     description: Get all members with their total meals and wallet amount given in the current month, including last wallet given date
 *     responses:
 *       200:
 *         description: List of all members with meal and wallet stats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   room:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                   picture:
 *                     type: string
 *                     description: URL or base64 of the member's profile picture
 *                   totalMeals:
 *                     type: integer
 *                     description: Total meals taken by the member in the current month
 *                   totalWalletGiven:
 *                     type: number
 *                     description: Total wallet amount given by the member in the current month
 *                   lastWalletGivenDate:
 *                     type: string
 *                     format: date-time
 *                     nullable: true
 *                     description: The date of the last wallet amount given in the current month; null if none
 */
router.get('/', memberController.getMembers);

/**
 * @swagger
 * /api/members:
 *   post:
 *     tags:
 *       - Members
 *     description: Create a new member
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - room
 *             properties:
 *               name:
 *                 type: string
 *               room:
 *                 type: string
 *                 description: The ID of the room the member will be assigned to (ObjectId of 'Room')
 *               picture:
 *                 type: string
 *                 description: Optional picture URL or base64 string
 *     responses:
 *       201:
 *         description: Member created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 room:
 *                   type: string
 *                 picture:
 *                   type: string
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', memberController.createMember);

/**
 * @swagger
 * /api/members/{id}:
 *   delete:
 *     tags:
 *       - Members
 *     description: Delete a member by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the member to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Member deleted successfully
 *       404:
 *         description: Member not found
 *       500:
 *         description: Server error during deletion
 */
router.delete('/:id', memberController.deleteMember);

module.exports = router;