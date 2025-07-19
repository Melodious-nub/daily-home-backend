const Member = require('../models/Member');
const Wallet = require('../models/Wallet');
const Meal = require('../models/Meal');
const Bazar = require('../models/Bazar');

exports.getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    const start = new Date(from);
    const end = new Date(to);

    // 1. Total Bazar Cost
    const totalBazarCostAgg = await Bazar.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalCost: { $sum: '$cost' }
        }
      }
    ]);
    const totalBazarCost = totalBazarCostAgg[0]?.totalCost || 0;

    // 2. Total Meals
    const totalMealsAgg = await Meal.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalMeals: { $sum: '$meals' }
        }
      }
    ]);
    const totalMeals = totalMealsAgg[0]?.totalMeals || 0;

    // 3. Meal Rate
    const mealRate = totalMeals > 0 ? totalBazarCost / totalMeals : 0;

    // 4. Wallets: Total money per member
    const wallets = await Wallet.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$member',
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    const walletMap = {};
    wallets.forEach(w => {
      walletMap[w._id.toString()] = w.totalAmount;
    });

    // 5. Meals: Total meal per member
    const meals = await Meal.aggregate([
      {
        $match: {
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$member',
          totalMeal: { $sum: '$meals' }
        }
      }
    ]);
    const mealMap = {};
    meals.forEach(m => {
      mealMap[m._id.toString()] = m.totalMeal;
    });

    // 6. Members
    const members = await Member.find().populate('room');

    const report = members.map(member => {
      const memberId = member._id.toString();
      const totalMeal = mealMap[memberId] || 0;
      const totalWallet = walletMap[memberId] || 0;
      const totalCost = totalMeal * mealRate;
      const remaining = totalWallet - totalCost;

      return {
        member: member.name,
        room: member.room.name,
        totalMeal,
        totalWallet,
        totalCost: parseFloat(totalCost.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2))
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
    console.error(err);
    res.status(500).json({ message: 'Error generating summary report.' });
  }
};