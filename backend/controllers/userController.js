// controllers/userController.js
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/appError');
const { generatePresignedUrl } = require('../utils/bucket');

const addPresignedUrlToUser = async (user) => {
  if (!user) return null;

  const userJson = user.toJSON ? user.toJSON() : user;

  // Generate presigned URL for avatar if it exists
  if (userJson.avatar) {
    try {
      userJson.avatarUrl = await generatePresignedUrl(userJson.avatar);
    } catch (error) {
      console.error('Error generating avatar URL:', error);
      userJson.avatarUrl = null;
    }
  } else {
    userJson.avatarUrl = null;
  }

  return userJson;
};

const addPresignedUrlToUsers = async (users) => {
  if (!users || users.length === 0) return [];

  const usersJson = users.map(u => u.toJSON ? u.toJSON() : u);

  return await Promise.all(usersJson.map(async (user) => {
    if (user.avatar) {
      try {
        user.avatarUrl = await generatePresignedUrl(user.avatar);
      } catch (error) {
        console.error('Error generating avatar URL for user ID', user.id, error);
        user.avatarUrl = null;
      }
    } else {
      user.avatarUrl = null;
    }
    return user;
  }));
};

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    const userWithUrls = await addPresignedUrlToUser(user);

    res.status(200).json({
      success: true,
      data: {
        user: userWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar, address } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update allowed fields only
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (address) updateData.address = address;

    await user.update(updateData);

    // Return user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/users/password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current password and new password', 400));
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Update password (will be hashed by model hook)
    await user.update({ password: newPassword });

    res.status(200).json({
      success: true,
      data: {
        message: 'Password updated successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

// ===================================================
// Admin controllers
// ===================================================

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });

    const usersWithUrls = await addPresignedUrlToUsers(users);

    res.status(200).json({
      success: true,
      data: {
        users: usersWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID (admin only)
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    const userWithUrls = await addPresignedUrlToUser(user);

    res.status(200).json({
      success: true,
      data: {
        user: userWithUrls
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user (admin only)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, role, isActive } = req.body;

    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update allowed fields only
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    await user.update(updateData);

    // Return user without password
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user (admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      data: {
        message: 'User deleted successfully'
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};