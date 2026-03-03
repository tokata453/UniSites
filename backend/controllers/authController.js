// controllers/authController.js
const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const AppError = require('../utils/appError');
const passport = require('../config/passport');

/**
 * @desc    Register new user 
 * @route   POST /api/auth/register 
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return next(new AppError('Please provide all required fields', 400));      
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // Will be hashed by model hook
      phone,
      role: 'customer' // Default role
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(new AppError('Account is deactivated', 401));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};

const googleCallbackHandler = (req, res) => {
  // This function will be called after successful Google authentication
  // The user info will be in req.user
  const token = generateToken(req.user);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
      },
      token
    }
  });
};

const facebookCallbackHandler = (req, res) => {
  // This function will be called after successful Facebook authentication
  // The user info will be in req.user
  const token = generateToken(req.user);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
      },
      token
    }
  });
};

module.exports = {
  register,
  login,
  getMe,
  googleCallbackHandler,
  facebookCallbackHandler
};