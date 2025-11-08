const requestCounts = new Map();

const createLimiter = (windowMs, max) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }
    
    const requests = requestCounts.get(key);
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests, please try again later'
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(key, recentRequests);
    
    next();
  };
};

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of requestCounts.entries()) {
    const recentRequests = requests.filter(time => now - time < 3600000);
    if (recentRequests.length === 0) {
      requestCounts.delete(key);
    } else {
      requestCounts.set(key, recentRequests);
    }
  }
}, 3600000);

exports.loginLimiter = createLimiter(15 * 60 * 1000, 5); 
exports.otpLimiter = createLimiter(60 * 1000, 3); 
exports.apiLimiter = createLimiter(60 * 1000, 100); 
