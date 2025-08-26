const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bazarSchema = new Schema({
  date: { 
    type: Date, 
    required: true 
  },
  cost: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String 
  },
  mess: { 
    type: Schema.Types.ObjectId, 
    ref: 'Mess', 
    required: true 
  },
  addedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // Track if this bazar was automatically added to wallet
  walletDepositCreated: {
    type: Boolean,
    default: false,
    description: 'Whether this bazar expense was automatically added to user wallet'
  },
  walletDepositId: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet',
    description: 'Reference to the wallet deposit created for this bazar'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bazar', bazarSchema);