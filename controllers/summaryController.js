const Meal = require('../models/Meal');
const Wallet = require('../models/Wallet');
const Bazar = require('../models/Bazar');
const Member = require('../models/Member');

exports.getSummary = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1); // 1–12
    const year = new Date().getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6); // 12PM BD
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 5, 59, 59); // 11:59AM BD

    const todayMealsAgg = await Meal.aggregate([
      { $match: { date: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
    ]);
    const todaysTotalMealCount = todayMealsAgg[0]?.totalMeals || 0;

    const monthMealsAgg = await Meal.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
    ]);
    const totalMealByThisMonth = monthMealsAgg[0]?.totalMeals || 0;

    const walletAgg = await Wallet.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalWalletBalance = walletAgg[0]?.totalAmount || 0;

    const bazarAgg = await Bazar.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalCost: { $sum: '$cost' } } }
    ]);
    const totalBazarCost = bazarAgg[0]?.totalCost || 0;

    const mealRate = totalMealByThisMonth > 0 ? totalBazarCost / totalMealByThisMonth : 0;
    const totalRemainingWalletBalance = totalWalletBalance - totalBazarCost;

    const memberMeals = await Meal.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$member', totalMeal: { $sum: '$meals' } } }
    ]);
    const mealMap = {};
    memberMeals.forEach(entry => mealMap[entry._id.toString()] = entry.totalMeal);

    const memberWallets = await Wallet.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$member', totalWallet: { $sum: '$amount' } } }
    ]);
    const walletMap = {};
    memberWallets.forEach(entry => walletMap[entry._id.toString()] = entry.totalWallet);

    const members = await Member.find().populate('room');

    const memberWise = members.map(m => {
      const id = m._id.toString();
      const totalMeal = mealMap[id] || 0;
      const totalWallet = walletMap[id] || 0;
      const mealCost = totalMeal * mealRate;
      const remaining = totalWallet - mealCost;

      return {
        _id: m._id,
        name: m.name,
        picture: m.picture,
        room: m.room?.name || '',
        totalMeal,
        totalWallet,
        totalCost: parseFloat(mealCost.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2))
      };
    });

    res.json({
      month,
      todaysTotalMealCount,
      totalMealByThisMonth,
      totalWalletBalance,
      totalRemainingWalletBalance: parseFloat(totalRemainingWalletBalance.toFixed(2)),
      mealRate: parseFloat(mealRate.toFixed(2)),
      memberWise
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate monthly summary.' });
  }
};