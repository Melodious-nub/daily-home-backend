const Room = require('../models/Room');
const Member = require('../models/Member');
const Wallet = require('../models/Wallet');
const Meal = require('../models/Meal');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find();

    const result = await Promise.all(rooms.map(async (room) => {
      const roomId = room._id;

      // Fetch members in this room
      const members = await Member.find({ room: roomId }).select('_id name picture');
      const memberIds = members.map(m => m._id);
      const memberCount = members.length;

      // Wallet total for all members in this room
      const walletAgg = await Wallet.aggregate([
        { $match: { member: { $in: memberIds } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const walletBalance = walletAgg[0]?.total || 0;

      // Total meals for all members in this room
      const mealAgg = await Meal.aggregate([
        { $match: { member: { $in: memberIds } } },
        { $group: { _id: null, totalMeals: { $sum: '$meals' } } }
      ]);
      const totalMeals = mealAgg[0]?.totalMeals || 0;

      return {
        ...room.toObject(),
        members,
        memberCount,
        walletBalance,
        totalMeals
      };
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, rentPercent } = req.body;
    const newRoom = new Room({ name, rentPercent });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};