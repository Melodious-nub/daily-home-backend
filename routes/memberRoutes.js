const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

/**
 * @swagger
 * /api/members:
 *   get:
 *     tags:
 *       - Members
 *     description: Get all members
 *     responses:
 *       200:
 *         description: List of all members
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
 *                     type: string
 *                     description: The ID of the room that the member belongs to
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
