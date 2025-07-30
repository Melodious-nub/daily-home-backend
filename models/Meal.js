const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mealSchema = new Schema({
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
  date: { 
    type: Date, 
    required: true 
  },
  meals: { 
    type: Number, 
    required: true 
  }, // number of meals eaten by this user on this date
  addedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meal', mealSchema);
