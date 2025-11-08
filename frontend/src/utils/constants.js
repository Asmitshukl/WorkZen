// src/utils/constants.js - COMPLETE FILE

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Roles - Update to match backend exactly
export const ROLES = {
  ADMIN: 'Admin',
  HR_OFFICER: 'HR Officer',
  PAYROLL_OFFICER: 'Payroll Officer',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee'
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS = {
  [ROLES.ADMIN]: 'Full system access - manage all aspects of the system',
  [ROLES.HR_OFFICER]: 'Manage employees, attendance, and time off requests',
  [ROLES.PAYROLL_OFFICER]: 'Manage payroll, approve time off, view reports',
  [ROLES.MANAGER]: 'Approve time off requests for team members',
  [ROLES.EMPLOYEE]: 'Basic access - view personal data and request time off'
};

// Departments
export const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Sales',
  'Marketing',
  'Operations',
  'IT',
  'Customer Support',
  'Product',
  'Legal',
  'Administration'
];

// Designations
export const DESIGNATIONS = [
  'Software Engineer',
  'Senior Software Engineer',
  'Team Lead',
  'Manager',
  'Senior Manager',
  'Director',
  'VP',
  'HR Manager',
  'HR Executive',
  'Accountant',
  'Finance Manager',
  'Sales Executive',
  'Sales Manager',
  'Marketing Executive',
  'Marketing Manager',
  'Operations Manager',
  'IT Support',
  'System Administrator',
  'Customer Support Executive',
  'Product Manager',
  'Business Analyst',
  'Data Analyst',
  'Designer',
  'Intern',
  'Consultant'
];

// Gender options
export const GENDERS = [
  'Male',
  'Female',
  'Other'
];

// Marital Status options
export const MARITAL_STATUS = [
  'Single',
  'Married',
  'Divorced',
  'Widowed'
];

// Time Off Types
export const TIMEOFF_TYPES = {
  PAID: 'Paid Time Off',
  SICK: 'Sick Time Off',
  UNPAID: 'Unpaid Leave'
};

// Time Off Status
export const TIMEOFF_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  ON_LEAVE: 'On Leave'
};

// Payroll Status
export const PAYROLL_STATUS = {
  DRAFT: 'Draft',
  COMPUTED: 'Computed',
  VALIDATED: 'Validated',
  DONE: 'Done',
  CANCELLED: 'Cancelled'
};

// Status Colors for UI
export const STATUS_COLORS = {
  // Attendance
  'Present': 'bg-green-100 text-green-800',
  'Absent': 'bg-red-100 text-red-800',
  'On Leave': 'bg-blue-100 text-blue-800',
  
  // Time Off
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Approved': 'bg-green-100 text-green-800',
  'Rejected': 'bg-red-100 text-red-800',
  
  // Payroll
  'Draft': 'bg-gray-100 text-gray-800',
  'Computed': 'bg-blue-100 text-blue-800',
  'Validated': 'bg-purple-100 text-purple-800',
  'Done': 'bg-green-100 text-green-800',
  'Cancelled': 'bg-red-100 text-red-800',
  
  // General
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  
  // Time Off Types
  'Paid Time Off': 'bg-blue-100 text-blue-800',
  'Sick Time Off': 'bg-red-100 text-red-800',
  'Unpaid Leave': 'bg-gray-100 text-gray-800'
};

// Date Formats
export const DATE_FORMAT = 'DD/MM/YYYY';
export const TIME_FORMAT = 'hh:mm A';
export const DATETIME_FORMAT = 'DD/MM/YYYY hh:mm A';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Salary Components
export const SALARY_COMPONENTS = {
  EARNINGS: [
    { name: 'Basic Salary', percentage: 50, description: 'Base salary component' },
    { name: 'House Rent Allowance', percentage: 50, description: 'HRA - 50% of basic' },
    { name: 'Standard Allowance', percentage: 16.67, description: 'Fixed allowance' },
    { name: 'Performance Bonus', percentage: 8.33, description: 'Variable bonus' },
    { name: 'Leave Travel Allowance', percentage: 8.33, description: 'LTA component' },
    { name: 'Fixed Allowance', percentage: 11.67, description: 'Fixed portion' }
  ],
  DEDUCTIONS: [
    { name: 'PF Employee', percentage: 12, description: 'Employee PF contribution' },
    { name: 'PF Employer', percentage: 12, description: 'Employer PF contribution' },
    { name: 'Professional Tax', amount: 200, description: 'PT deduction' }
  ]
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10}$/,
  PAN_REGEX: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  IFSC_REGEX: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  OTP_LENGTH: 6,
  MAX_NAME_LENGTH: 50,
  MAX_ADDRESS_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 500
};

// Working Days
export const WORKING_DAYS_PER_MONTH = 22;
export const WORKING_HOURS_PER_DAY = 8;
export const BREAK_TIME_HOURS = 1;

// Leave Allocations (Annual)
export const LEAVE_ALLOCATION = {
  PAID_TIME_OFF: 24,
  SICK_TIME_OFF: 7,
  UNPAID_LEAVE: -1 // Unlimited
};

// Default Values
export const DEFAULT_VALUES = {
  COMPANY_NAME: 'HR Payroll System',
  COMPANY_CODE: 'HRP',
  DEFAULT_WAGE: 30000,
  DEFAULT_CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  TIMEZONE: 'Asia/Kolkata'
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  gray: '#6B7280'
};

// Export all as default as well
export default {
  API_BASE_URL,
  ROLES,
  ROLE_DESCRIPTIONS,
  DEPARTMENTS,
  DESIGNATIONS,
  GENDERS,
  MARITAL_STATUS,
  TIMEOFF_TYPES,
  TIMEOFF_STATUS,
  ATTENDANCE_STATUS,
  PAYROLL_STATUS,
  STATUS_COLORS,
  DATE_FORMAT,
  TIME_FORMAT,
  DATETIME_FORMAT,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  SALARY_COMPONENTS,
  VALIDATION_RULES,
  WORKING_DAYS_PER_MONTH,
  WORKING_HOURS_PER_DAY,
  BREAK_TIME_HOURS,
  LEAVE_ALLOCATION,
  DEFAULT_VALUES,
  CHART_COLORS
};