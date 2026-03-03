// routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getMe, googleCallbackHandler, facebookCallbackHandler } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const passport = require('../config/passport');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 * @required fields: { firstName, lastName, email, password, phone (optional) } = req.body;
 * @returns  res.status(201).json({
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
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @required fields: { email, password } = req.body;
 * @returns  res.status(200).json({
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
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 * @requires JWT token in Authorization header
 * @returns  res.status(200).json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.phone,
          role: req.user.role
        }
      }
    });
 */
router.get('/me', protect, getMe);

/**
 * @route   GET /api/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handle Google OAuth callback
 * @access  Public
 */
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), googleCallbackHandler);

/**
 * @route   GET /api/auth/facebook
 * @desc    Initiate Facebook OAuth
 * @access  Public
 */
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['public_profile', 'email'],
    session: false,
  })
);

/**
 * @route   GET /api/auth/facebook/callback
 * @desc    Handle Facebook OAuth callback
 * @access  Public
 */
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), facebookCallbackHandler);


module.exports = router;