exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(400).json({
      success: false,
      message: 'Duplicate value - record already exists'
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Referenced record does not exist'
    });
  }

  // PostgreSQL not null violation
  if (err.code === '23502') {
    return res.status(400).json({
      success: false,
      message: 'Required field is missing'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
