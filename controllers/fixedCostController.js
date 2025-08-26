const FixedCost = require('../models/FixedCost');
const { auth, requireMess, requireMessAdmin } = require('../middleware/auth');

// @desc    Get mess fixed costs
// @route   GET /api/fixed-costs
// @access  Private
exports.getFixedCosts = async (req, res) => {
  try {
    const fixedCosts = await FixedCost.find({ 
      mess: req.user.currentMess,
      isActive: true 
    })
    .populate('addedBy', 'fullName email')
    .sort({ createdAt: -1 });
    
    res.json(fixedCosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add fixed cost
// @route   POST /api/fixed-costs
// @access  Private (Mess Admin/Moderator)
exports.addFixedCost = async (req, res) => {
  try {
    const { name, amount, type, description } = req.body;
    
    // Check if user has permission (admin or moderator)
    if (!req.user.isMessAdmin && req.user.messRole !== 'moderator') {
      return res.status(403).json({ message: 'Access denied. Admin or moderator required' });
    }
    
    const fixedCost = new FixedCost({
      mess: req.user.currentMess,
      name,
      amount,
      type: type || 'other',
      description,
      addedBy: req.user._id
    });
    
    const savedFixedCost = await fixedCost.save();
    const populatedFixedCost = await savedFixedCost.populate('addedBy', 'fullName email');
    
    res.status(201).json(populatedFixedCost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Update fixed cost
// @route   PUT /api/fixed-costs/:id
// @access  Private (Mess Admin/Moderator)
exports.updateFixedCost = async (req, res) => {
  try {
    const { name, amount, type, description } = req.body;
    const { id } = req.params;
    
    // Check if user has permission (admin or moderator)
    if (!req.user.isMessAdmin && req.user.messRole !== 'moderator') {
      return res.status(403).json({ message: 'Access denied. Admin or moderator required' });
    }
    
    const fixedCost = await FixedCost.findById(id);
    
    if (!fixedCost) {
      return res.status(404).json({ message: 'Fixed cost not found' });
    }
    
    if (fixedCost.mess.toString() !== req.user.currentMess.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    fixedCost.name = name || fixedCost.name;
    fixedCost.amount = amount || fixedCost.amount;
    fixedCost.type = type || fixedCost.type;
    fixedCost.description = description || fixedCost.description;
    
    const updatedFixedCost = await fixedCost.save();
    const populatedFixedCost = await updatedFixedCost.populate('addedBy', 'fullName email');
    
    res.json(populatedFixedCost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Delete fixed cost
// @route   DELETE /api/fixed-costs/:id
// @access  Private (Mess Admin/Moderator)
exports.deleteFixedCost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user has permission (admin or moderator)
    if (!req.user.isMessAdmin && req.user.messRole !== 'moderator') {
      return res.status(403).json({ message: 'Access denied. Admin or moderator required' });
    }
    
    const fixedCost = await FixedCost.findById(id);
    
    if (!fixedCost) {
      return res.status(404).json({ message: 'Fixed cost not found' });
    }
    
    if (fixedCost.mess.toString() !== req.user.currentMess.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Soft delete by setting isActive to false
    fixedCost.isActive = false;
    await fixedCost.save();
    
    res.json({ message: 'Fixed cost deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get fixed cost summary
// @route   GET /api/fixed-costs/summary
// @access  Private
exports.getFixedCostSummary = async (req, res) => {
  try {
    const fixedCosts = await FixedCost.find({ 
      mess: req.user.currentMess,
      isActive: true 
    });
    
    const totalAmount = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
    
    const summaryByType = fixedCosts.reduce((acc, cost) => {
      if (!acc[cost.type]) {
        acc[cost.type] = {
          count: 0,
          totalAmount: 0,
          items: []
        };
      }
      acc[cost.type].count++;
      acc[cost.type].totalAmount += cost.amount;
      acc[cost.type].items.push({
        id: cost._id,
        name: cost.name,
        amount: cost.amount,
        description: cost.description
      });
      return acc;
    }, {});
    
    res.json({
      totalAmount,
      totalCount: fixedCosts.length,
      summaryByType
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
