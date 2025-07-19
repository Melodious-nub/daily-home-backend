const Bazar = require('../models/Bazar');

exports.getBazars = async (req, res) => {
  try {
    const bazars = await Bazar.find();
    res.json(bazars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addBazar = async (req, res) => {
  try {
    const { date, cost, description } = req.body;
    const bazar = new Bazar({ date, cost, description });
    const savedBazar = await bazar.save();
    res.status(201).json(savedBazar);
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
