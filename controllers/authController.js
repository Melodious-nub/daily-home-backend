const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTPEmail } = require('../utils/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET); // No expiry - unlimited token
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but is not verified, allow them to sign up again
      if (!existingUser.isEmailVerified) {
        // Delete the unverified user and allow new signup
        await User.findByIdAndDelete(existingUser._id);
      } else {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName,
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp, fullName);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.status(201).json({
      message: 'User registered successfully. Please check your email for OTP verification.',
      userId: user._id,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (!user.verifyOTP(otp)) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    const emailSent = await sendOTPEmail(user.email, otp, user.fullName);
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send OTP email' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Please verify your email first',
        userId: user._id,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
        currentMess: user.currentMess,
        isMessAdmin: user.isMessAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('currentMess', 'name identifierCode');

    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  signup,
  verifyOTP,
  resendOTP,
  login,
  getMe,
}; 