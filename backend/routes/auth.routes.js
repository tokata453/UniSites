'use strict';
const router   = require('express').Router();
const passport = require('passport');
const c        = require('../controllers/auth.controller');
const { authenticate }  = require('../middleware/auth.middleware');
const { authLimiter }   = require('../middleware/rateLimit.middleware');
const { uploadAvatar }  = require('../config/cloudinary');

// ── Local ─────────────────────────────────────────────────────────────────────
router.post('/register',         authLimiter, c.register);
router.post('/login',            authLimiter, c.login);
router.put('/change-password',   authenticate, c.changePassword);

// ── OAuth ─────────────────────────────────────────────────────────────────────
router.get('/google',            authLimiter, passport.authenticate('google',   { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',   passport.authenticate('google',   { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth/error` }), c.oauthCallback);
router.get('/facebook',          authLimiter, passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth/error` }), c.oauthCallback);

// ── User ──────────────────────────────────────────────────────────────────────
router.get('/me',                authenticate, c.getMe);
router.put('/profile',           authenticate, uploadAvatar.single('avatar'), c.updateProfile);
router.post('/logout',           authenticate, c.logout);
router.get('/notifications',     authenticate, c.getNotifications);
router.put('/notifications/read',authenticate, c.markAllNotificationsRead);
router.get('/saved',             authenticate, c.getSavedItems);
router.post('/saved',            authenticate, c.toggleSavedItem);

module.exports = router;
