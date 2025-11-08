const OTP = require('../models/OTP');
const { sendEmail } = require('./emailService');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createAndSendOTP(email, purpose = 'login') {
  const otpCode = generateOTP();
  
  await OTP.create(email, otpCode, purpose);
  
  const subject = purpose === 'signup' ? 'Verify Your Account' : 'Login OTP';
  const message = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${subject}</h2>
      <p style="font-size: 16px;">Your OTP is:</p>
      <div style="background: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 5px;">${otpCode}</span>
      </div>
      <p style="color: #666;">This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
      <p style="color: #999; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    </div>
  `;
  
  await sendEmail(email, subject, message);
  
  return { success: true, message: 'OTP sent successfully' };
}

async function verifyOTP(email, otpCode, purpose) {
  return await OTP.verify(email, otpCode, purpose);
}

module.exports = {
  generateOTP,
  createAndSendOTP,
  verifyOTP
};
