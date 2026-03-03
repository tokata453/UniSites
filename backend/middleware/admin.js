// middleware/admin.js
const AppError = require('../utils/appError');

/**
 * Check if user is admin
 * Must be used AFTER protect middleware
 * Usage: app.delete('/users/:id', protect, admin, handler)
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }
};

module.exports = { admin };