const Meal = require('../models/Meal');

// @desc    Get mess meals
// @route   GET /api/meals
// @access  Private
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ mess: req.user.currentMess })
      .populate('user', 'fullName email')
      .populate('addedBy', 'fullName email')
      .sort({ date: -1 });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add meal entry
// @route   POST /api/meals
// @access  Private
exports.addMeal = async (req, res) => {
  try {
    const { userId, date, meals } = req.body;
    
    // Check if user is in the same mess
    if (userId !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Can only add meals for yourself' });
    }
    
    const mealEntry = new Meal({ 
      user: userId, 
      mess: req.user.currentMess,
      date, 
      meals,
      addedBy: req.user._id
    });
    
    const savedMeal = await mealEntry.save();
    const populatedMeal = await savedMeal.populate('user', 'fullName email');
    res.status(201).json(populatedMeal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Add multiple meals for a date (admin only)
// @route   POST /api/meals/bulk
// @access  Private (Mess Admin)
exports.addBulkMeals = async (req, res) => {
  try {
    const { date, meals } = req.body; // meals: [{ userId, meals }]
    
    const mealEntries = meals.map(meal => ({
      user: meal.userId,
      mess: req.user.currentMess,
      date,
      meals: meal.meals,
      addedBy: req.user._id
    }));
    
    const savedMeals = await Meal.insertMany(mealEntries);
    const populatedMeals = await Meal.find({ _id: { $in: savedMeals.map(m => m._id) } })
      .populate('user', 'fullName email');
    
    res.status(201).json(populatedMeals);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete meal entry
// @route   DELETE /api/meals/:id
// @access  Private
exports.deleteMeal = async (req, res) => {
  try {
    const meal = await Meal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    
    if (meal.mess.toString() !== req.user.currentMess.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Meal deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
