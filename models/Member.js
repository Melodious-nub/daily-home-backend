const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const memberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mess: {
    type: Schema.Types.ObjectId,
    ref: 'Mess',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);
