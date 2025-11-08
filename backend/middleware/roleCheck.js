// backend/middleware/roleCheck.js
const { ROLES } = require('../config/constants');

// Role hierarchy: Admin > HR Officer > Payroll Officer > Manager > Employee
const roleHierarchy = {
  [ROLES.ADMIN]: 5,
  [ROLES.HR_OFFICER]: 4,
  [ROLES.PAYROLL_OFFICER]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.EMPLOYEE]: 1
};

// Define permissions for each role
const rolePermissions = {
  [ROLES.ADMIN]: {
    canManageEmployees: true,
    canManageAttendance: true,
    canManageTimeOff: true,
    canApproveTimeOff: true,
    canManagePayroll: true,
    canAccessReports: true,
    canAccessSettings: true,
    canManageUsers: true,
    canViewAllData: true
  },
  [ROLES.HR_OFFICER]: {
    canManageEmployees: true,
    canManageAttendance: true,
    canManageTimeOff: true,
    canApproveTimeOff: true,
    canManagePayroll: false,
    canAccessReports: true,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: true
  },
  [ROLES.PAYROLL_OFFICER]: {
    canManageEmployees: false,
    canManageAttendance: true, // Can view only
    canManageTimeOff: false,
    canApproveTimeOff: true,
    canManagePayroll: true,
    canAccessReports: true,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: false
  },
  [ROLES.MANAGER]: {
    canManageEmployees: false,
    canManageAttendance: false,
    canManageTimeOff: false,
    canApproveTimeOff: true,
    canManagePayroll: false,
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: false
  },
  [ROLES.EMPLOYEE]: {
    canManageEmployees: false,
    canManageAttendance: false,
    canManageTimeOff: false,
    canApproveTimeOff: false,
    canManagePayroll: false,
    canAccessReports: false,
    canAccessSettings: false,
    canManageUsers: false,
    canViewAllData: false
  }
};

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Please login'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const userPermissions = rolePermissions[req.user.role];
    
    if (!userPermissions || !userPermissions[permission]) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

exports.isHROrAdmin = (req, res, next) => {
  if (![ROLES.ADMIN, ROLES.HR_OFFICER].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'HR Officer or Admin access required'
    });
  }
  next();
};

exports.isPayrollOrAdmin = (req, res, next) => {
  if (![ROLES.ADMIN, ROLES.PAYROLL_OFFICER].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Payroll Officer or Admin access required'
    });
  }
  next();
};

exports.canApproveTimeOff = (req, res, next) => {
  const approverRoles = [ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER, ROLES.MANAGER];
  
  if (!approverRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to approve time off requests'
    });
  }
  next();
};

exports.canAccessReports = (req, res, next) => {
  const reportRoles = [ROLES.ADMIN, ROLES.HR_OFFICER, ROLES.PAYROLL_OFFICER];
  
  if (!reportRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access reports'
    });
  }
  next();
};

// Helper function to check if user has permission
exports.hasPermission = (userRole, permission) => {
  const permissions = rolePermissions[userRole];
  return permissions && permissions[permission] === true;
};

// Helper function to compare role levels
exports.hasHigherRole = (userRole, compareRole) => {
  return roleHierarchy[userRole] > roleHierarchy[compareRole];
};

module.exports = exports;