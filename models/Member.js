const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  picture: {
    type: String,
    default: '',
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
