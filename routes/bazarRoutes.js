const express = require('express');
const router = express.Router();
const bazarController = require('../controllers/bazarController');
const { auth, requireMess } = require('../middleware/auth');

/**
 * @swagger
 * /api/bazars:
 *   get:
 *     tags:
 *       - Bazars
 *     description: Get all bazar entries for the mess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all bazars for the mess
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   date: { type: string, format: date }
 *                   cost: { type: number }
 *                   description: { type: string, nullable: true }
 *                   mess: { type: string }
 *                   addedBy:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       fullName: { type: string }
 *                       email: { type: string }
 */
router.get('/', auth, requireMess, bazarController.getBazars);

/**
 * @swagger
 * /api/bazars:
 *   post:
 *     tags:
 *       - Bazars
 *     description: Add a new bazar entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, cost]
 *             properties:
 *               date: { type: string, format: date }
 *               cost: { type: number }
 *               description: { type: string, nullable: true }
 *     responses:
 *       201:
 *         description: Bazar added successfully
 *       400:
 *         description: Invalid request
 */
router.post('/', auth, requireMess, bazarController.addBazar);

/**
 * @swagger
 * /api/bazars/{id}:
 *   delete:
 *     tags:
 *       - Bazars
 *     description: Delete a bazar entry by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the bazar entry to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bazar deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Bazar not found
 */
router.delete('/:id', auth, requireMess, bazarController.deleteBazar);

module.exports = router;
