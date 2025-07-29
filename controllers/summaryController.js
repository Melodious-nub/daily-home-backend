const Meal = require('../models/Meal');
const Wallet = require('../models/Wallet');
const Bazar = require('../models/Bazar');
const Member = require('../models/Member');

// Helper function to get Bangladesh time
const getBangladeshTime = () => {
  const now = new Date();
  // Bangladesh is UTC+6
  const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000));
  return bdTime;
};

// Helper function to get today's date range in Bangladesh time (12 AM to 11:59 PM)
const getTodayDateRange = () => {
  const bdNow = getBangladeshTime();
  const todayStart = new Date(bdNow.getFullYear(), bdNow.getMonth(), bdNow.getDate());
  const todayEnd = new Date(bdNow.getFullYear(), bdNow.getMonth(), bdNow.getDate(), 23, 59, 59, 999);
  
  // Convert back to UTC for database queries
  const utcTodayStart = new Date(todayStart.getTime() - (6 * 60 * 60 * 1000));
  const utcTodayEnd = new Date(todayEnd.getTime() - (6 * 60 * 60 * 1000));
  
  return { utcTodayStart, utcTodayEnd, bdNow };
};

exports.getSummary = async (req, res) => {
  try {
    const bdCurrent = getBangladeshTime();
    const currentMonth = bdCurrent.getMonth() + 1; // 1-12
    const currentYear = bdCurrent.getFullYear();
    
    const month = parseInt(req.query.month) || currentMonth; // 1–12
    
    // Calculate the correct year for the requested month
    let year = currentYear;
    if (month > currentMonth) {
      // If requested month is greater than current month, it's from previous year
      year = currentYear - 1;
    } else if (month < currentMonth) {
      // If requested month is less than current month, it's from current year
      year = currentYear;
    }
    // If month equals current month, use current year

    // Monthly date range (1st day to last day of month)
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Get today's date range in Bangladesh time
    const { utcTodayStart, utcTodayEnd, bdNow } = getTodayDateRange();

    // Today's total meal count (Bangladesh time: 12 AM to 11:59 PM)
    const todayMealsAgg = await Meal.aggregate([
      { $match: { date: { $gte: utcTodayStart, $lte: utcTodayEnd } } },
      { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
    ]);
    const todaysTotalMealCount = todayMealsAgg[0]?.totalMeals || 0;

    // Get all members first (needed for today's breakdown)
    const members = await Member.find().populate('room');

    // Today's member-wise meal breakdown
    const todayMemberMeals = await Meal.aggregate([
      { $match: { date: { $gte: utcTodayStart, $lte: utcTodayEnd } } },
      { $group: { _id: '$member', totalMeals: { $sum: '$meals' } } }
    ]);

    // Get member details for today's meals
    const todayMealMap = {};
    todayMemberMeals.forEach(entry => todayMealMap[entry._id.toString()] = entry.totalMeals);

    // Create today's meals breakdown string
    const todayMealsBreakdown = [];
    for (const member of members) {
      const memberId = member._id.toString();
      const todayMeals = todayMealMap[memberId] || 0;
      if (todayMeals > 0) {
        todayMealsBreakdown.push(`${member.name}: ${todayMeals}`);
      }
    }
    const todayMealsBreakDownByMembers = todayMealsBreakdown.join(', ');

    // Monthly meal count
    const monthMealsAgg = await Meal.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
    ]);
    const totalMealByThisMonth = monthMealsAgg[0]?.totalMeals || 0;

    // Total wallet balance for the month
    const walletAgg = await Wallet.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } }
    ]);
    const totalWalletBalance = walletAgg[0]?.totalAmount || 0;

    // Total bazar cost (total expense) for the month
    const bazarAgg = await Bazar.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalCost: { $sum: '$cost' } } }
    ]);
    const totalExpense = bazarAgg[0]?.totalCost || 0;

    const mealRate = totalMealByThisMonth > 0 ? totalExpense / totalMealByThisMonth : 0;
    const totalRemainingWalletBalance = totalWalletBalance - totalExpense;

    // Member-wise meal aggregation for the month
    const memberMeals = await Meal.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$member', totalMeal: { $sum: '$meals' } } }
    ]);
    const mealMap = {};
    memberMeals.forEach(entry => mealMap[entry._id.toString()] = entry.totalMeal);

    // Member-wise wallet aggregation for the month
    const memberWallets = await Wallet.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: '$member', totalWallet: { $sum: '$amount' } } }
    ]);
    const walletMap = {};
    memberWallets.forEach(entry => walletMap[entry._id.toString()] = entry.totalWallet);

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

    // Format today's date and time in Bangladesh timezone
    const todayDate = bdNow.toISOString().split('T')[0]; // YYYY-MM-DD
    const todayTime = bdNow.toTimeString().split(' ')[0]; // HH:MM:SS

    res.json({
      month,
      todayDate,
      todayTime,
      todaysTotalMealCount,
      todayMealsBreakDownByMembers,
      totalMealByThisMonth,
      totalWalletBalance,
      totalExpense,
      totalRemainingWalletBalance: parseFloat(totalRemainingWalletBalance.toFixed(2)),
      mealRate: parseFloat(mealRate.toFixed(2)),
      memberWise
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate monthly summary.' });
  }
};