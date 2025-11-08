const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Employee validation rules
const employeeValidation = [
  body('firstName').notEmpty().withMessage('First name is required').trim(),
  body('lastName').notEmpty().withMessage('Last name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
  body('joiningDate').isISO8601().withMessage('Valid joining date is required'),
  body('wage').isNumeric().withMessage('Wage must be a number').optional(),
  body('role')
    .optional()
    .isIn(['HR Officer', 'Payroll Officer', 'Manager', 'Employee'])
    .withMessage('Invalid role. Must be: HR Officer, Payroll Officer, Manager, or Employee')
];

// Registration validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
  body('companyName').notEmpty().withMessage('Company name is required').trim()
];

// Login validation rules
const loginValidation = [
  body('password').notEmpty().withMessage('Password is required')
];

// OTP validation rules
const otpValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
];

// Change password validation rules
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

// Time off validation rules
const timeOffValidation = [
  body('timeOffType')
    .isIn(['Paid Time Off', 'Sick Time Off', 'Unpaid Leave'])
    .withMessage('Invalid time off type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('reason').optional().trim()
];

// Payrun validation rules
const payrunValidation = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2020, max: 2100 })
    .withMessage('Valid year is required')
];

module.exports = {
  validate,
  employeeValidation,
  registerValidation,
  loginValidation,
  otpValidation,
  changePasswordValidation,
  timeOffValidation,
  payrunValidation
};
