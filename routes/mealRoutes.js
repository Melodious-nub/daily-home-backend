const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');

router.get('/', mealController.getMeals);
router.post('/', mealController.addMeal);
router.delete('/:id', mealController.deleteMeal);

module.exports = router;
