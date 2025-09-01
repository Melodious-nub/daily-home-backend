const express = require('express');
const router = express.Router();
const fixedCostController = require('../controllers/fixedCostController');
const { auth, requireMess } = require('../middleware/auth');

/**
 * @swagger
 * /api/fixed-costs:
 *   get:
 *     tags:
 *       - Fixed Costs
 *     summary: Get mess fixed costs
 *     description: Get all active fixed costs for the current mess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of fixed costs retrieved successfully
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
 *                   amount:
 *                     type: number
 *                   type:
 *                     type: string
 *                     enum: [houseRent, maidBill, wifiBill, electricityBill, gasBill, waterBill, cleaningBill, other]
 *                   description:
 *                     type: string
 *                   addedBy:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 */
router.get('/', auth, requireMess, fixedCostController.getFixedCosts);

/**
 * @swagger
 * /api/fixed-costs:
 *   post:
 *     tags:
 *       - Fixed Costs
 *     summary: Add fixed cost
 *     description: Add a new fixed cost to the mess (Admin/Moderator only)
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
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the fixed cost
 *               amount:
 *                 type: number
 *                 description: Amount of the fixed cost
 *               type:
 *                 type: string
 *                 enum: [houseRent, maidBill, wifiBill, electricityBill, gasBill, waterBill, cleaningBill, other]
 *                 description: Type of fixed cost (optional)
 *               description:
 *                 type: string
 *                 description: Optional description
 *     responses:
 *       201:
 *         description: Fixed cost added successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied - Admin or moderator required
 */
router.post('/', auth, requireMess, fixedCostController.addFixedCost);

/**
 * @swagger
 * /api/fixed-costs/{id}:
 *   put:
 *     tags:
 *       - Fixed Costs
 *     summary: Update fixed cost
 *     description: Update an existing fixed cost (Admin/Moderator only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fixed cost ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               amount:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [houseRent, maidBill, wifiBill, electricityBill, gasBill, waterBill, cleaningBill, other]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Fixed cost updated successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Access denied
 *       404:
 *         description: Fixed cost not found
 */
router.put('/:id', auth, requireMess, fixedCostController.updateFixedCost);

/**
 * @swagger
 * /api/fixed-costs/{id}:
 *   delete:
 *     tags:
 *       - Fixed Costs
 *     summary: Delete fixed cost
 *     description: Delete a fixed cost (Admin/Moderator only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Fixed cost ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Fixed cost deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Fixed cost not found
 */
router.delete('/:id', auth, requireMess, fixedCostController.deleteFixedCost);

/**
 * @swagger
 * /api/fixed-costs/summary:
 *   get:
 *     tags:
 *       - Fixed Costs
 *     summary: Get fixed cost summary
 *     description: Get summary of all fixed costs grouped by type
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Fixed cost summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAmount:
 *                   type: number
 *                   description: Total amount of all fixed costs
 *                 totalCount:
 *                   type: number
 *                   description: Total number of fixed costs
 *                 summaryByType:
 *                   type: object
 *                   description: Summary grouped by cost type
 */
router.get('/summary', auth, requireMess, fixedCostController.getFixedCostSummary);

module.exports = router;
