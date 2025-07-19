const mongoose = require('mongoose');

const bazarSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  cost: { type: Number, required: true },
  description: String,
});

module.exports = mongoose.model('Bazar', bazarSchema);
