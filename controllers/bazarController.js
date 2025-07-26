const Bazar = require('../models/Bazar');

exports.getBazars = async (req, res) => {
  try {
    const bazars = await Bazar.find()
      .populate('members', 'name picture') // ✅ Include name and picture only
      .sort({ date: -1 }); // Optional: sort latest first
    res.json(bazars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addBazar = async (req, res) => {
  try {
    const { date, cost, description, members } = req.body;
    const bazar = new Bazar({
      date,
      cost,
      description,
      members: members || [] // default empty array
    });
    const savedBazar = await bazar.save();
    const populatedBazar = await savedBazar.populate('members', 'name picture');
    res.status(201).json(populatedBazar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBazar = async (req, res) => {
  try {
    const bazar = await Bazar.findByIdAndDelete(req.params.id);
    if (!bazar) return res.status(404).json({ message: 'Bazar not found' });
    res.json({ message: 'Bazar entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
