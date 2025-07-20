const express = require('express');
const router = express.Router();
const bazarController = require('../controllers/bazarController');

/**
 * @swagger
 * /api/bazars:
 *   get:
 *     tags:
 *       - Bazars
 *     description: Get all bazars
 *     responses:
 *       200:
 *         description: List of all bazars
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   cost:
 *                     type: number
 *                   description:
 *                     type: string
 *                     nullable: true
 */
router.get('/', bazarController.getBazars);

/**
 * @swagger
 * /api/bazars:
 *   post:
 *     tags:
 *       - Bazars
 *     description: Add a new bazar entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - cost
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               cost:
 *                 type: number
 *               description:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Bazar added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 date:
 *                   type: string
 *                   format: date
 *                 cost:
 *                   type: number
 *                 description:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', bazarController.addBazar);

/**
 * @swagger
 * /api/bazars/{id}:
 *   delete:
 *     tags:
 *       - Bazars
 *     description: Delete a bazar entry by its ID
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
 *       404:
 *         description: Bazar not found
 *       500:
 *         description: Server error during deletion
 */
router.delete('/:id', bazarController.deleteBazar);

module.exports = router;
