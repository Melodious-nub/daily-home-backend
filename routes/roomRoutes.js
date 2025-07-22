const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get all rooms with member, wallet, and meal info
 *     description: Returns all rooms with member list, wallet balance, and total meals
 *     responses:
 *       200:
 *         description: List of all rooms with details
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
 *                   rentPercent:
 *                     type: number
 *                   memberCount:
 *                     type: number
 *                   walletBalance:
 *                     type: number
 *                   totalMeals:
 *                     type: number
 *                   members:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         picture:
 *                           type: string
 */
router.get('/', roomController.getRooms);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     tags:
 *       - Rooms
 *     description: Create a new room
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rentPercent
 *             properties:
 *               name:
 *                 type: string
 *               rentPercent:
 *                 type: number
 *                 description: Rent percentage for the room
 *     responses:
 *       201:
 *         description: Room created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 rentPercent:
 *                   type: number
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', roomController.createRoom);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     tags:
 *       - Rooms
 *     description: Delete a room by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the room to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room deleted successfully
 *       404:
 *         description: Room not found
 *       500:
 *         description: Server error during deletion
 */
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
