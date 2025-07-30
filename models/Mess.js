const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  identifierCode: {
    type: String,
    unique: true,
    length: 6,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

// Generate unique identifier code
messSchema.statics.generateIdentifierCode = async function() {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    const existingMess = await this.findOne({ identifierCode: code });
    if (!existingMess) {
      isUnique = true;
    }
  }
  
  return code;
};

// Pre-save middleware removed - identifier code is now generated in controller

module.exports = mongoose.model('Mess', messSchema); 