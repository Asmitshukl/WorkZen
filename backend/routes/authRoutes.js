const express = require('express');
const router = express.Router();
const {
  setupAdmin,
  verifyOTP,
  requestLoginOTP,
  login,
  changePassword,
  getCurrentUser,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter, otpLimiter } = require('../middleware/rateLimiter');
const {
  validate,
  registerValidation,
  loginValidation,
  otpValidation,
  changePasswordValidation
} = require('../middleware/validation');

router.post('/setup-admin', registerValidation, validate, setupAdmin);
router.post('/verify-otp', otpValidation, validate, verifyOTP);
router.post('/request-login-otp', otpLimiter, requestLoginOTP);
router.post('/login', loginLimiter, login);

router.use(protect);
router.post('/change-password', changePasswordValidation, validate, changePassword);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

module.exports = router;