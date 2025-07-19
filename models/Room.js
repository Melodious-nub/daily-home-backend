const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rentPercent: { type: Number, required: true }, // e.g. 40 for 40%
});

module.exports = mongoose.model('Room', roomSchema);
