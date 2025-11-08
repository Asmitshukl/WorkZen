// src/utils/validators.js

// Validate email
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

// Validate phone
export const validatePhone = (phone) => {
  if (!phone) return 'Phone number is required';
  
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
    return 'Please enter a valid 10-digit phone number';
  }
  
  return null;
};

// Validate password
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)';
  }
  
  return null;
};

// Validate confirm password
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

// Validate name
export const validateName = (name, fieldName = 'Name') => {
  if (!name || name.trim() === '') {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  if (name.trim().length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  
  return null;
};

// Validate required field
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Validate number
export const validateNumber = (value, fieldName = 'This field', min, max) => {
  if (!value && value !== 0) {
    return `${fieldName} is required`;
  }
  
  const num = parseFloat(value);
  
  if (isNaN(num)) {
    return `${fieldName} must be a valid number`;
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} must be at least ${min}`;
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  
  return null;
};

// Validate date
export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return `Please enter a valid ${fieldName.toLowerCase()}`;
  }
  
  return null;
};

// Validate date range
export const validateDateRange = (startDate, endDate) => {
  if (!startDate) return 'Start date is required';
  if (!endDate) return 'End date is required';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime())) return 'Invalid start date';
  if (isNaN(end.getTime())) return 'Invalid end date';
  
  if (end < start) {
    return 'End date must be after start date';
  }
  
  return null;
};

// Validate PAN number (Indian)
export const validatePAN = (pan) => {
  if (!pan) return null; // Optional field
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan.toUpperCase())) {
    return 'Please enter a valid PAN number (e.g., ABCDE1234F)';
  }
  
  return null;
};

// Validate IFSC code (Indian)
export const validateIFSC = (ifsc) => {
  if (!ifsc) return null; // Optional field
  
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(ifsc.toUpperCase())) {
    return 'Please enter a valid IFSC code (e.g., SBIN0001234)';
  }
  
  return null;
};

// Validate account number
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) return null; // Optional field
  
  const cleaned = accountNumber.replace(/\D/g, '');
  if (cleaned.length < 9 || cleaned.length > 18) {
    return 'Account number must be between 9 and 18 digits';
  }
  
  return null;
};

// Validate file
export const validateFile = (file, maxSize = 5 * 1024 * 1024, allowedTypes = []) => {
  if (!file) return 'Please select a file';
  
  if (file.size > maxSize) {
    return `File size must not exceed ${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
  }
  
  return null;
};

// Validate URL
export const validateURL = (url) => {
  if (!url) return null; // Optional field
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Validate employee form
export const validateEmployeeForm = (formData) => {
  const errors = {};
  
  const firstNameError = validateName(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;
  
  const lastNameError = validateName(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const joiningDateError = validateDate(formData.joiningDate, 'Joining date');
  if (joiningDateError) errors.joiningDate = joiningDateError;
  
  if (formData.wage) {
    const wageError = validateNumber(formData.wage, 'Wage', 0);
    if (wageError) errors.wage = wageError;
  }
  
  if (formData.dateOfBirth) {
    const dobError = validateDate(formData.dateOfBirth, 'Date of birth');
    if (dobError) errors.dateOfBirth = dobError;
    
    // Check if age is at least 18
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    if (age < 18) {
      errors.dateOfBirth = 'Employee must be at least 18 years old';
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate time off form
export const validateTimeOffForm = (formData) => {
  const errors = {};
  
  if (!formData.timeOffType) {
    errors.timeOffType = 'Please select a time off type';
  }
  
  const startDateError = validateDate(formData.startDate, 'Start date');
  if (startDateError) errors.startDate = startDateError;
  
  const endDateError = validateDate(formData.endDate, 'End date');
  if (endDateError) errors.endDate = endDateError;
  
  if (!startDateError && !endDateError) {
    const rangeError = validateDateRange(formData.startDate, formData.endDate);
    if (rangeError) errors.endDate = rangeError;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate login form
export const validateLoginForm = (formData) => {
  const errors = {};
  
  if (!formData.loginId && !formData.email) {
    errors.loginId = 'Login ID or Email is required';
  }
  
  if (!formData.password) {
    errors.password = 'Password is required';
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

// Validate OTP
export const validateOTP = (otp) => {
  if (!otp) return 'OTP is required';
  
  if (!/^[0-9]{6}$/.test(otp)) {
    return 'OTP must be 6 digits';
  }
  
  return null;
};

export default {
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateName,
  validateRequired,
  validateNumber,
  validateDate,
  validateDateRange,
  validatePAN,
  validateIFSC,
  validateAccountNumber,
  validateFile,
  validateURL,
  validateEmployeeForm,
  validateTimeOffForm,
  validateLoginForm,
  validateOTP
};