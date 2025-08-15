const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP email
const sendOTPEmail = async (email, otp, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DailyHome - Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
        <h2 style="color: #000000; margin-bottom: 20px; font-size: 24px;">DailyHome Email Verification</h2>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Hello ${fullName},</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Your verification code is:</p>
        <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #000000; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
        </div>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">This code will expire in 3 minutes.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">If you didn't request this code, please ignore this email.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Best regards,<br>DailyHome Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send Password Reset OTP email
const sendPasswordResetEmail = async (email, otp, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DailyHome - Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
        <h2 style="color: #000000; margin-bottom: 20px; font-size: 24px;">DailyHome Password Reset</h2>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Hello ${fullName || 'User'},</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Use the code below to reset it:</p>
        <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #000000; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
        </div>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">This code will expire in 3 minutes.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Best regards,<br>DailyHome Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send Signup Verification OTP email
const sendSignupVerificationEmail = async (email, otp, fullName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DailyHome - Complete Your Signup (Email Verification)',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
        <h2 style="color: #000000; margin-bottom: 20px; font-size: 24px;">Welcome to DailyHome!</h2>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Hello ${fullName || 'User'},</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Thank you for signing up. To complete your registration, please verify your email address using the code below:</p>
        <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #000000; font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
        </div>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">This code will expire in 3 minutes.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">If you did not sign up for a DailyHome account, you can safely ignore this email.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Best regards,<br>DailyHome Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send Mess Request Accepted Email
const sendMessRequestAcceptedEmail = async (email, fullName, messName, messAddress, identifierCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DailyHome - Your Mess Join Request Has Been Accepted! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
        <h2 style="color: #28a745; margin-bottom: 20px; font-size: 24px;">🎉 Welcome to Your New Mess!</h2>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Hello ${fullName},</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Great news! Your request to join <strong>${messName}</strong> has been accepted by the mess admin.</p>
        
        <div style="background-color: #f8f9fa; border: 2px solid #28a745; border-radius: 8px; padding: 20px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #28a745; margin-top: 0;">Mess Details:</h3>
          <p style="color: #000000; font-size: 16px; line-height: 1.5;"><strong>Name:</strong> ${messName}</p>
          <p style="color: #000000; font-size: 16px; line-height: 1.5;"><strong>Address:</strong> ${messAddress}</p>
          <p style="color: #000000; font-size: 16px; line-height: 1.5;"><strong>Identifier Code:</strong> ${identifierCode}</p>
        </div>
        
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">You can now access your mess dashboard and start managing your meals, expenses, and other mess activities.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Welcome to the DailyHome family! 🏠</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Best regards,<br>DailyHome Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send Mess Request Rejected Email
const sendMessRequestRejectedEmail = async (email, fullName, messName, identifierCode) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'DailyHome - Mess Join Request Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; color: #000000;">
        <h2 style="color: #dc3545; margin-bottom: 20px; font-size: 24px;">Mess Join Request Update</h2>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Hello ${fullName},</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">We regret to inform you that your request to join <strong>${messName}</strong> has been declined by the mess admin.</p>
        
        <div style="background-color: #f8f9fa; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h3 style="color: #dc3545; margin-top: 0;">Request Details:</h3>
          <p style="color: #000000; font-size: 16px; line-height: 1.5;"><strong>Mess Name:</strong> ${messName}</p>
          <p style="color: #000000; font-size: 16px; line-height: 1.5;"><strong>Identifier Code:</strong> ${identifierCode}</p>
          <p style="color: #000000; font-size: 16px; line-height: 1.5;"><strong>Status:</strong> <span style="color: #dc3545;">Rejected</span></p>
        </div>
        
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Don't worry! You can still join other messes or create your own mess. There are plenty of opportunities to find the perfect accommodation for you.</p>
        <p style="color: #000000; font-size: 16px; line-height: 1.5;">Best regards,<br>DailyHome Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};



module.exports = {
  sendOTPEmail,
  sendPasswordResetEmail,
  sendSignupVerificationEmail,
  sendMessRequestAcceptedEmail,
  sendMessRequestRejectedEmail,
}; 