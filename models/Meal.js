const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  date: { type: Date, required: true },
  meals: { type: Number, required: true }, // number of meals eaten by this member on this date
});

module.exports = mongoose.model('Meal', mealSchema);
