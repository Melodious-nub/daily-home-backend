const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  currentMess: {
    type: Schema.Types.ObjectId,
    ref: 'Mess',
    default: null,
  },
  isMessAdmin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate OTP
userSchema.methods.generateOTP = function() {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
  
  this.otp = {
    code: otp,
    expiresAt: expiresAt
  };
  
  return otp;
};

// Method to verify OTP
userSchema.methods.verifyOTP = function(otpCode) {
  if (!this.otp || !this.otp.code || !this.otp.expiresAt) {
    return false;
  }
  
  if (this.otp.expiresAt < new Date()) {
    return false;
  }
  
  return this.otp.code === otpCode;
};

module.exports = mongoose.model('User', userSchema); 