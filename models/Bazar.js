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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bazar', bazarSchema);