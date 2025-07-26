const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bazarSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  cost: { type: Number, required: true },
  description: { type: String },
  members: [{ type: Schema.Types.ObjectId, ref: 'Member' }] // ✅ New field
}, {
  timestamps: true
});

module.exports = mongoose.model('Bazar', bazarSchema);