const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');

/**
 * @swagger
 * /api/summary:
 *   get:
 *     tags:
 *       - Summary
 *     description: Get a summary report of the bazar cost, total meals, meal rate, and financial report for each member
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         description: The start date of the report (ISO 8601 format).
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: to
 *         required: true
 *         description: The end date of the report (ISO 8601 format).
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Summary report generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     from:
 *                       type: string
 *                       format: date
 *                     to:
 *                       type: string
 *                       format: date
 *                     totalBazarCost:
 *                       type: number
 *                       description: The total cost of bazar for the given period
 *                     totalMeals:
 *                       type: number
 *                       description: The total number of meals for the given period
 *                     mealRate:
 *                       type: number
 *                       description: The rate of each meal (totalBazarCost / totalMeals)
 *                 report:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       member:
 *                         type: string
 *                       room:
 *                         type: string
 *                       totalMeal:
 *                         type: number
 *                       totalWallet:
 *                         type: number
 *                       totalCost:
 *                         type: number
 *                         description: Total cost for the meals consumed by the member
 *                       remaining:
 *                         type: number
 *                         description: Remaining balance after meal cost deduction
 *       500:
 *         description: Error generating the summary report
 */
router.get('/', summaryController.getSummary);

module.exports = router;
