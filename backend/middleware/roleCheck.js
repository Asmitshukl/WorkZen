const { ROLES } = require('../config/constants');

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this route`
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
  if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.HR_OFFICER) {
    return res.status(403).json({
      success: false,
      message: 'HR Officer or Admin access required'
    });
  }
  next();
};

exports.isPayrollOrAdmin = (req, res, next) => {
  if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.PAYROLL_OFFICER) {
    return res.status(403).json({
      success: false,
      message: 'Payroll Officer or Admin access required'
    });
  }
  next();
};
