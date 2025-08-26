const Bazar = require('../models/Bazar');
const Mess = require('../models/Mess');
const Wallet = require('../models/Wallet');

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

// @desc    Get bazar with wallet deposit info
// @route   GET /api/bazars/:id
// @access  Private
exports.getBazarById = async (req, res) => {
  try {
    const bazar = await Bazar.findById(req.params.id)
      .populate('addedBy', 'fullName email')
      .populate('walletDepositId', 'amount type description date');
    
    if (!bazar) {
      return res.status(404).json({ message: 'Bazar not found' });
    }
    
    if (bazar.mess.toString() !== req.user.currentMess.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(bazar);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get bazar summary with wallet integration
// @route   GET /api/bazars/summary
// @access  Private
exports.getBazarSummary = async (req, res) => {
  try {
    const bazars = await Bazar.find({ mess: req.user.currentMess })
      .populate('addedBy', 'fullName email')
      .populate('walletDepositId', 'amount type description date')
      .sort({ date: -1 });

    const totalBazarCost = bazars.reduce((sum, bazar) => sum + bazar.cost, 0);
    const totalWalletDeposits = bazars
      .filter(bazar => bazar.walletDepositCreated)
      .reduce((sum, bazar) => sum + bazar.cost, 0);

    const userWiseBazar = {};
    bazars.forEach(bazar => {
      const userId = bazar.addedBy._id.toString();
      if (!userWiseBazar[userId]) {
        userWiseBazar[userId] = {
          user: bazar.addedBy,
          totalBazarCost: 0,
          totalWalletDeposits: 0,
          bazarCount: 0
        };
      }
      userWiseBazar[userId].totalBazarCost += bazar.cost;
      userWiseBazar[userId].bazarCount += 1;
      if (bazar.walletDepositCreated) {
        userWiseBazar[userId].totalWalletDeposits += bazar.cost;
      }
    });

    res.json({
      totalBazarCost,
      totalWalletDeposits,
      bazarCount: bazars.length,
      userWiseBazar: Object.values(userWiseBazar),
      bazars
    });
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
    
    // Get mess configuration
    const mess = await Mess.findById(req.user.currentMess);
    if (!mess) {
      return res.status(404).json({ message: 'Mess not found' });
    }

    // Create bazar entry
    const bazar = new Bazar({
      date,
      cost,
      description,
      mess: req.user.currentMess,
      addedBy: req.user._id
    });

    // If bazarIsDeposit is enabled, automatically add to user's wallet
    if (mess.bazarIsDeposit) {
      const walletDeposit = new Wallet({
        user: req.user._id,
        mess: req.user.currentMess,
        amount: cost,
        type: 'bazar_deposit',
        description: `Bazar deposit: ${description || 'Grocery shopping'}`,
        date: date
      });

      const savedWalletDeposit = await walletDeposit.save();
      
      // Update bazar with wallet deposit reference
      bazar.walletDepositCreated = true;
      bazar.walletDepositId = savedWalletDeposit._id;
    }

    const savedBazar = await bazar.save();
    const populatedBazar = await savedBazar.populate('addedBy', 'fullName email');
    
    res.status(201).json({
      ...populatedBazar.toObject(),
      walletDepositCreated: bazar.walletDepositCreated,
      walletDepositId: bazar.walletDepositId
    });
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
    
    // If bazar had an associated wallet deposit, delete it too
    if (bazar.walletDepositCreated && bazar.walletDepositId) {
      await Wallet.findByIdAndDelete(bazar.walletDepositId);
    }
    
    await Bazar.findByIdAndDelete(req.params.id);
    res.json({ message: 'Bazar entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
