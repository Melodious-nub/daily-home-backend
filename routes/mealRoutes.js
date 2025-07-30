const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { auth, requireMess, requireMessAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/meals:
 *   get:
 *     tags:
 *       - Meals
 *     description: Get all meals for the mess
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all meals for the mess
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   user:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       fullName: { type: string }
 *                       email: { type: string }
 *                   mess:
 *                     type: string
 *                   date:
 *                     type: string
 *                     format: date
 *                   meals:
 *                     type: number
 *                   addedBy:
 *                     type: object
 *                     properties:
 *                       _id: { type: string }
 *                       fullName: { type: string }
 *                       email: { type: string }
 */
router.get('/', auth, requireMess, mealController.getMeals);

/**
 * @swagger
 * /api/meals:
 *   post:
 *     tags:
 *       - Meals
 *     description: Add a new meal entry for yourself
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - date
 *               - meals
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user (must be the authenticated user)
 *               date:
 *                 type: string
 *                 format: date
 *               meals:
 *                 type: number
 *                 description: Number of meals consumed on the given date
 *     responses:
 *       201:
 *         description: Meal added successfully
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', auth, requireMess, mealController.addMeal);

/**
 * @swagger
 * /api/meals/bulk:
 *   post:
 *     tags:
 *       - Meals
 *     description: Add multiple meals for a date (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - meals
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               meals:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     meals:
 *                       type: number
 *     responses:
 *       201:
 *         description: Meals added successfully
 *       403:
 *         description: Access denied, mess admin required
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/bulk', auth, requireMess, requireMessAdmin, mealController.addBulkMeals);

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     tags:
 *       - Meals
 *     description: Delete a meal entry by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the meal entry to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Meal not found
 */
router.delete('/:id', auth, requireMess, mealController.deleteMeal);

module.exports = router;
