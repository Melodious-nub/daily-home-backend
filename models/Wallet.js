const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  mess: { 
    type: Schema.Types.ObjectId, 
    ref: 'Mess', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'meal_deduction'],
    default: 'deposit'
  },
  description: {
    type: String,
    default: ''
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
});

module.exports = mongoose.model('Wallet', walletSchema);
