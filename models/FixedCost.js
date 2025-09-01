const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fixedCostSchema = new Schema({
  mess: {
    type: Schema.Types.ObjectId,
    ref: 'Mess',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  type: {
    type: String,
    required: false,
    enum: ['houseRent', 'maidBill', 'wifiBill', 'electricityBill', 'gasBill', 'waterBill', 'cleaningBill', 'other'],
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true
});

// Index for efficient queries
fixedCostSchema.index({ mess: 1, isActive: 1 });

module.exports = mongoose.model('FixedCost', fixedCostSchema);
