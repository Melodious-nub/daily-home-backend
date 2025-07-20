const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

/**
 * @swagger
 * /api/meals:
 *   get:
 *     tags:
 *       - Meals
 *     description: Get all meals
 *     responses:
 *       200:
 *         description: List of all meals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   member:
 *                     type: string
 *                     description: The ID of the member
 *                   date:
 *                     type: string
 *                     format: date
 *                   meals:
 *                     type: number
 */
router.get('/', mealController.getMeals);

/**
 * @swagger
 * /api/meals:
 *   post:
 *     tags:
 *       - Meals
 *     description: Add a new meal entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - member
 *               - date
 *               - meals
 *             properties:
 *               member:
 *                 type: string
 *                 description: The ID of the member who ate the meal (ObjectId of 'Member')
 *               date:
 *                 type: string
 *                 format: date
 *               meals:
 *                 type: number
 *                 description: Number of meals consumed by the member on the given date
 *     responses:
 *       201:
 *         description: Meal added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 member:
 *                   type: string
 *                   description: The ID of the member
 *                 date:
 *                   type: string
 *                   format: date
 *                 meals:
 *                   type: number
 *       400:
 *         description: Bad request, missing required fields or invalid data
 */
router.post('/', mealController.addMeal);

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     tags:
 *       - Meals
 *     description: Delete a meal entry by its ID
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
 *       404:
 *         description: Meal not found
 *       500:
 *         description: Server error during deletion
 */
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
