// controllers/calculateController.js
const Meal = require('../models/Meal');
const Wallet = require('../models/Wallet');
const Bazar = require('../models/Bazar');
const Member = require('../models/Member');

exports.getSummaryByDateRange = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: 'Both "from" and "to" dates are required in YYYY-MM-DD format.' });
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    // Fetch data in range
    const members = await Member.find();
    const bazars = await Bazar.find({ date: { $gte: startDate, $lte: endDate } });
    const wallets = await Wallet.find({ createdAt: { $gte: startDate, $lte: endDate } });
    const meals = await Meal.find({ date: { $gte: startDate, $lte: endDate } });

    // Calculations
    const totalBazarCost = bazars.reduce((sum, b) => sum + b.cost, 0);
    const totalMeals = meals.reduce((sum, m) => sum + m.meals, 0);
    const mealRate = totalMeals === 0 ? 0 : totalBazarCost / totalMeals;

    // Per member breakdown
    const report = members.map(member => {
      const memberMeals = meals.filter(m => m.member.toString() === member._id.toString());
      const totalMeal = memberMeals.reduce((sum, m) => sum + m.meals, 0);

      const memberWallets = wallets.filter(w => w.member.toString() === member._id.toString());
      const totalWallet = memberWallets.reduce((sum, w) => sum + w.amount, 0);

      const totalCost = parseFloat((totalMeal * mealRate).toFixed(2));
      const remaining = parseFloat((totalWallet - totalCost).toFixed(2));

      return {
        member: member.name,
        room: member.room,
        totalMeal,
        totalWallet,
        totalCost,
        remaining
      };
    });

    res.json({
      summary: {
        from,
        to,
        totalBazarCost,
        totalMeals,
        mealRate: parseFloat(mealRate.toFixed(2))
      },
      report
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
