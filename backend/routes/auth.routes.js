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
router.get('/google/callback', (req, res, next) => {
  console.log('[OAuth][Google] Callback received', {
    hasCode: Boolean(req.query.code),
    error: req.query.error || null,
    scope: req.query.scope || null,
  });

  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error('[OAuth][Google] Passport error:', err.message, err.stack);
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?provider=google&message=${encodeURIComponent(err.message || 'Google authentication failed')}`);
    }

    if (!user) {
      const message = info?.message || req.query.error_description || req.query.error || 'Google authentication failed';
      console.error('[OAuth][Google] Authentication failed:', message, info || null);
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?provider=google&message=${encodeURIComponent(message)}`);
    }

    req.user = user;
    console.log('[OAuth][Google] Authentication succeeded', {
      userId: user.id,
      role: user.Role?.name,
      email: user.email,
    });
    return c.oauthCallback(req, res, next);
  })(req, res, next);
});
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
