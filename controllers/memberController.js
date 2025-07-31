const Member = require('../models/Member');
const Meal = require('../models/Meal');
const Wallet = require('../models/Wallet');

exports.getMembers = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const members = await Member.find().populate('room').lean();

    const membersWithStats = await Promise.all(
      members.map(async (member) => {
        // Sum total meals in current month
        const mealAgg = await Meal.aggregate([
          { $match: { member: member._id, date: { $gte: firstDay, $lte: lastDay } } },
          { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
        ]);
        const totalMeals = mealAgg.length > 0 ? mealAgg[0].totalMeals : 0;

        // Sum total wallet given and get last wallet date in current month
        const walletAgg = await Wallet.aggregate([
          { $match: { member: member._id, date: { $gte: firstDay, $lte: lastDay } } },
          { 
            $group: { 
              _id: null, 
              totalGiven: { $sum: '$amount' },
              lastGivenDate: { $max: '$date' }
            } 
          }
        ]);
        const totalWalletGiven = walletAgg.length > 0 ? walletAgg[0].totalGiven : 0;
        const lastWalletGivenDate = walletAgg.length > 0 ? walletAgg[0].lastGivenDate : null;

        return {
          ...member,
          totalMeals,
          totalWalletGiven,
          lastWalletGivenDate,
        };
      })
    );

    res.json(membersWithStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { name, room, picture } = req.body;
    const newMember = new Member({ name, room, picture });
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


exports.deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
