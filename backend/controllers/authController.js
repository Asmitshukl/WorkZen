const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const { generateLoginId } = require('../utils/loginIdGenerator');
const { generatePassword } = require('../utils/PasswordGenerator');
const { createAndSendOTP, verifyOTP } = require('../utils/otpService');
const { sendWelcomeEmail } = require('../utils/emailService');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

exports.setupAdmin = async (req, res) => {
  try {
    const existingAdmin = await User.findOne({ role: 'Admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    const { name, email, phone, companyName } = req.body;
    
    // Validate company name
    if (!companyName || companyName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Company name is required'
      });
    }

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || firstName;

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      phone,
      company: companyName.trim(),
      joiningDate: new Date(),
      wage: 100000
    });

    await Employee.calculateSalaryComponents(employee.id, 100000);

    const loginId = await generateLoginId(firstName, lastName, new Date());
    const tempPassword = generatePassword();

    const user = await User.create({
      loginId,
      email,
      password: tempPassword,
      role: 'Admin',
      employeeId: employee.id
    });

    // Auto-verify admin email - no OTP needed
    await User.update(user.id, { isEmailVerified: true });

    await Employee.update(employee.id, { userId: user.id });

    // Send welcome email with credentials
    await sendWelcomeEmail(email, name, loginId, tempPassword);

    res.status(201).json({
      success: true,
      message: 'Admin created successfully. Check email for login credentials.',
      data: { loginId, email, company: companyName }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await verifyOTP(email, otp, 'signup');

    if (!result.success) {
      return res.status(400).json(result);
    }

    const user = await User.findByEmail(email);
    if (user) {
      await User.update(user.id, { isEmailVerified: true });
    }

    res.json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.requestLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    await createAndSendOTP(email, 'login');

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { loginId, email, password, otp } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const identifier = loginId || email;
    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: 'Login ID or Email is required'
      });
    }

    const user = await User.findByEmailOrLoginId(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await User.comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // REMOVED: Email verification check - users can login even if email not verified
    // REMOVED: OTP verification - direct login after password validation

    await User.update(user.id, { lastLogin: new Date() });

    const token = generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      mustChangePassword: user.must_change_password,
      token,
      user: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
        employee: user.employee
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);

    const isValid = await User.comparePassword(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    await User.updatePassword(userId, newPassword);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        id: user.id,
        loginId: user.login_id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.is_email_verified,
        mustChangePassword: user.must_change_password,
        employee: user.employee
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};