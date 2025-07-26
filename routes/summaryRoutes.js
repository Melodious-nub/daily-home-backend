const express = require('express');
const router = express.Router();
const summaryController = require('../controllers/summaryController');

/**
 * @swagger
 * /api/summary:
 *   get:
 *     tags:
 *       - Summary
 *     summary: Get monthly summary report
 *     description: >
 *       Returns financial and meal summary for the current month or a selected month.
 *       It includes total meals, total wallet, bazar cost, meal rate, and per-member stats.
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         description: Filter by month (1–12). Defaults to current month if not provided.
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: Summary report for selected month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: integer
 *                   description: Month number being summarized
 *                 todaysTotalMealCount:
 *                   type: number
 *                   description: Total meals today (12PM–12AM BD)
 *                 totalMealByThisMonth:
 *                   type: number
 *                 totalWalletBalance:
 *                   type: number
 *                 totalRemainingWalletBalance:
 *                   type: number
 *                 mealRate:
 *                   type: number
 *                 memberWise:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       picture:
 *                         type: string
 *                       room:
 *                         type: string
 *                       totalMeal:
 *                         type: number
 *                       totalWallet:
 *                         type: number
 *                       totalCost:
 *                         type: number
 *                       remaining:
 *                         type: number
 *       500:
 *         description: Failed to generate summary
 */
router.get('/', summaryController.getSummary);

module.exports = router;