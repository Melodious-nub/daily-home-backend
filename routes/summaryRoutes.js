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
 *       It includes today's total meal count, monthly stats, financials, meal rate, and per-member breakdown.
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
 *         description: Summary report for the selected month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 month:
 *                   type: integer
 *                   description: Month number being summarized (1-12)
 *                 todayDate:
 *                   type: string
 *                   format: date
 *                   description: Today's date in YYYY-MM-DD (Bangladesh time)
 *                 todayTime:
 *                   type: string
 *                   description: Current time (Bangladesh time) in HH:MM:SS
 *                 todaysTotalMealCount:
 *                   type: number
 *                   description: Total meals today (Bangladesh time, 12AM-11:59PM)
 *                 todayMealsBreakDownByMembers:
 *                   type: string
 *                   description: Comma-separated breakdown of today's meals by member (e.g. "John 2, Jane 1, Bob 3")
 *                 totalMealByThisMonth:
 *                   type: number
 *                   description: Total number of meals for this month
 *                 totalWalletBalance:
 *                   type: number
 *                   description: Total money added to wallets this month
 *                 totalExpense:
 *                   type: number
 *                   description: Total bazar cost (expense) this month
 *                 totalRemainingWalletBalance:
 *                   type: number
 *                   description: Total remaining wallet balance (wallet - expense)
 *                 mealRate:
 *                   type: number
 *                   description: Cost per meal this month (totalExpense / totalMealByThisMonth)
 *                 memberWise:
 *                   type: array
 *                   description: Member-wise meal and financial summary
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Member ID
 *                       name:
 *                         type: string
 *                       picture:
 *                         type: string
 *                         description: Member profile image URL
 *                       room:
 *                         type: string
 *                         description: Member's room name
 *                       totalMeal:
 *                         type: number
 *                         description: Total meals for this member this month
 *                       totalWallet:
 *                         type: number
 *                         description: Total wallet added by this member this month
 *                       totalCost:
 *                         type: number
 *                         description: Total meal cost for this member (mealRate * totalMeal)
 *                       remaining:
 *                         type: number
 *                         description: Wallet remaining after deducting meal cost
 *       500:
 *         description: Failed to generate summary
 */
router.get('/', summaryController.getSummary);

module.exports = router;