const Wallet = require('../models/Wallet');

exports.getWallets = async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('member');
    res.json(wallets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMoney = async (req, res) => {
  try {
    const { member, amount } = req.body;
    const walletEntry = new Wallet({ member, amount });
    const savedEntry = await walletEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findByIdAndDelete(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    res.json({ message: 'Wallet deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
