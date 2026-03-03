// middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/appError');

/**
 * Protect routes - verify JWT token
 * Usage: app.get('/protected', protect, handler)
 * @requires JWT token in Authorization header (Bearer TOKEN)
 * @returns 401 if token is missing, invalid, or user no longer exists
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if authorization header exists and starts with 'Bearer'
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header: "Bearer TOKEN"
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(new AppError('Not authorized token to access', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');

      // Get user from database (exclude password)
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return next(new AppError('User no longer exists', 401));
      }

      if (!user.isActive) {
        return next(new AppError('User account is deactivated', 401));
      }

      // Attach user to request object
      req.user = user;
      next();

    } catch (error) {
      return next(new AppError('Invalid token', 401));
    }

  } catch (error) {
    next(error);
  }
};

module.exports = { protect };