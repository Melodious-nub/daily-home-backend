const Bazar = require('../models/Bazar');

// @desc    Get mess bazars
// @route   GET /api/bazars
// @access  Private
exports.getBazars = async (req, res) => {
  try {
    const bazars = await Bazar.find({ mess: req.user.currentMess })
      .populate('addedBy', 'fullName email')
      .sort({ date: -1 });
    res.json(bazars);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add bazar entry
// @route   POST /api/bazars
// @access  Private
exports.addBazar = async (req, res) => {
  try {
    const { date, cost, description } = req.body;
    const bazar = new Bazar({
      date,
      cost,
      description,
      mess: req.user.currentMess,
      addedBy: req.user._id
    });
    const savedBazar = await bazar.save();
    const populatedBazar = await savedBazar.populate('addedBy', 'fullName email');
    res.status(201).json(populatedBazar);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete bazar entry
// @route   DELETE /api/bazars/:id
// @access  Private
exports.deleteBazar = async (req, res) => {
  try {
    const bazar = await Bazar.findById(req.params.id);
    
    if (!bazar) {
      return res.status(404).json({ message: 'Bazar not found' });
    }
    
    if (bazar.mess.toString() !== req.user.currentMess.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Bazar.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bazar entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
