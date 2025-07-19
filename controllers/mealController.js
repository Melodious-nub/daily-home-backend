const Meal = require('../models/Meal');

exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find().populate('member');
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMeal = async (req, res) => {
  try {
    const { member, date, meals } = req.body;
    const mealEntry = new Meal({ member, date, meals });
    const savedMeal = await mealEntry.save();
    res.status(201).json(savedMeal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findByIdAndDelete(req.params.id);
    if (!meal) return res.status(404).json({ message: 'Meal not found' });
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
