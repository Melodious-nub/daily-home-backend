const Wallet = require('../models/Wallet');
const { auth, requireMess } = require('../middleware/auth');

// @desc    Get user's wallet transactions
// @route   GET /api/wallets
// @access  Private
exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find({ 
      user: req.user._id,
      mess: req.user.currentMess 
    }).sort({ date: -1 });
    
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallets
// @access  Private
exports.addMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;
    
    const walletEntry = new Wallet({ 
      user: req.user._id,
      mess: req.user.currentMess,
      amount,
      type: 'deposit',
      description: description || 'Wallet deposit'
    });
    
    const savedEntry = await walletEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get mess wallet summary (admin only)
// @route   GET /api/wallets/summary
// @access  Private (Mess Admin)
exports.getMessWalletSummary = async (req, res) => {
  try {
    const wallets = await Wallet.find({ 
      mess: req.user.currentMess 
    }).populate('user', 'fullName email');
    
    // Calculate balance for each user
    const userBalances = {};
    wallets.forEach(wallet => {
      const userId = wallet.user._id.toString();
      if (!userBalances[userId]) {
        userBalances[userId] = {
          user: wallet.user,
          balance: 0,
          transactions: []
        };
      }
      
      if (wallet.type === 'deposit') {
        userBalances[userId].balance += wallet.amount;
      } else {
        userBalances[userId].balance -= wallet.amount;
      }
      
      userBalances[userId].transactions.push(wallet);
    });
    
    res.json(Object.values(userBalances));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete wallet transaction (admin only)
// @route   DELETE /api/wallets/:id
// @access  Private (Mess Admin)
exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet transaction not found' });
    }
    
    if (wallet.mess.toString() !== req.user.currentMess.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Wallet.findByIdAndDelete(req.params.id);
    res.json({ message: 'Wallet transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
