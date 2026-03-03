// routes/users.js
const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
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
          role: req.user.role,
          avatar: req.user.avatar,
          address: req.user.address
        }
      }
    });
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 * @requires JWT token in Authorization header - Fields (optional): { firstName, lastName, phone, avatar, address } = req.body;
 * @returns  res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          address: user.address
        }
      }
    });
 */
router.put('/profile', protect, updateProfile);

/**
 * @route   PUT /api/users/password
 * @desc    Change password
 * @access  Private
 * @requires JWT token in Authorization header - Fields: { currentPassword, newPassword } = req.body;
 * @validation newPassword must be at least 6 characters
 * @returns    res.status(200).json({
      success: true,
      data: {
        message: 'Password updated successfully'
      }
    });
 */
router.put('/password', protect, changePassword);


// ===================================================
// Admin routes for user management
// ===================================================

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private/Admin
 * @requires JWT token in Authorization header with admin role
 * @return res.status(200).json({
      success: true,
      data: {
        users: [
          {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive
          },
          ...
        ]
      }
    });
 */
router.get('/', protect, admin, getUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private/Admin
 * @requires JWT token in Authorization header with admin role
 * @return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
 */
router.get('/:id', protect, admin, getUserById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user by ID
 * @access  Private/Admin
 * @requires JWT token in Authorization header with admin role - Fields (optional): (firstName, lastName, email, phone, role, isActive) = req.body;
 * @return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isActive: user.isActive
        }
      }
    });
 */
router.put('/:id', protect, admin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user by ID
 * @access  Private/Admin
 * @requires JWT token in Authorization header with admin role
 * @return res.status(200).json({
      success: true,
      data: {
        message: 'User deleted successfully'
      }
    });
 */
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
