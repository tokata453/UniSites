'use strict';
const passport = require('passport');
const GoogleStrategy   = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy    = require('passport-local').Strategy;

const normalizeGooglePhoto = (url) => {
  if (!url) return null;
  if (!url.includes('googleusercontent.com')) return url;

  if (/[?&]sz=\d+/i.test(url)) {
    return url.replace(/([?&])sz=\d+/i, '$1sz=256');
  }

  if (/=s\d+-c$/i.test(url)) {
    return url.replace(/=s\d+-c$/i, '=s256-c');
  }

  return `${url}${url.includes('?') ? '&' : '?'}sz=256`;
};

const getSocialAvatar = (profile, provider) => {
  const rawUrl =
    profile?.photos?.find((photo) => photo?.value)?.value ||
    profile?._json?.picture ||
    profile?._json?.image?.url ||
    null;

  if (!rawUrl) return null;
  return provider === 'google' ? normalizeGooglePhoto(rawUrl) : rawUrl;
};

module.exports = (db) => {
  const { User, Role } = db;

  // ── Local Strategy ────────────────────────────────────────────────────────
  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await User.scope('withPassword').findOne({
            where: { email, provider: 'local' },
            include: [{ model: Role, as: 'Role' }],
          });

          if (!user) return done(null, false, { message: 'No account found with that email' });
          if (!user.is_active) return done(null, false, { message: 'Account is deactivated' });
          const valid = await user.verifyPassword(password);
          if (!valid) return done(null, false, { message: 'Incorrect password' });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // ── Google Strategy ───────────────────────────────────────────────────────
  passport.use(
    new GoogleStrategy(
      {
        clientID:     process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:  process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const avatarUrl = getSocialAvatar(profile, 'google');

          // 1. Returning Google user — look up by provider_id
          let user = await User.findOne({
            where: { provider: 'google', provider_id: profile.id },
            include: [{ model: Role, as: 'Role' }],
          });

          if (user) {
            await user.update({
              name: profile.displayName || user.name,
              email: email || user.email,
              avatar_url: avatarUrl || user.avatar_url || null,
            });
            user = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role' }] });
          }

          // 2. Same email already exists (e.g. local account) — link it to Google
          if (!user && email) {
            user = await User.findOne({
              where: { email },
              include: [{ model: Role, as: 'Role' }],
            });
            if (user) {
              await user.update({
                provider:    'google',
                provider_id: profile.id,
                name:        user.name || profile.displayName,
                avatar_url:  user.avatar_url || avatarUrl || null,
              });
              user = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role' }] });
            }
          }

          // 3. Brand new user — create
          if (!user) {
            const studentRole = await Role.findOne({ where: { name: 'student' } });
            user = await User.create({
              name:        profile.displayName,
              email,
              avatar_url:  avatarUrl,
              provider:    'google',
              provider_id: profile.id,
              role_id:     studentRole?.id || null,
              is_active:   true,
            });
            user = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role' }] });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  // ── Facebook Strategy ─────────────────────────────────────────────────────
  passport.use(
    new FacebookStrategy(
      {
        clientID:      process.env.FACEBOOK_APP_ID,
        clientSecret:  process.env.FACEBOOK_APP_SECRET,
        callbackURL:   process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'photos', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || null;
          const avatarUrl = getSocialAvatar(profile, 'facebook');

          // 1. Returning Facebook user
          let user = await User.findOne({
            where: { provider: 'facebook', provider_id: profile.id },
            include: [{ model: Role, as: 'Role' }],
          });

          if (user) {
            await user.update({
              name: profile.displayName || user.name,
              email: email || user.email,
              avatar_url: avatarUrl || user.avatar_url || null,
            });
            user = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role' }] });
          }

          // 2. Same email exists — link it
          if (!user && email) {
            user = await User.findOne({
              where: { email },
              include: [{ model: Role, as: 'Role' }],
            });
            if (user) {
              await user.update({
                provider:    'facebook',
                provider_id: profile.id,
                name:        user.name || profile.displayName,
                avatar_url:  user.avatar_url || avatarUrl || null,
              });
              user = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role' }] });
            }
          }

          // 3. New user — create
          if (!user) {
            const studentRole = await Role.findOne({ where: { name: 'student' } });
            user = await User.create({
              name:        profile.displayName,
              email,
              avatar_url:  avatarUrl,
              provider:    'facebook',
              provider_id: profile.id,
              role_id:     studentRole?.id || null,
              is_active:   true,
            });
            user = await User.findByPk(user.id, { include: [{ model: Role, as: 'Role' }] });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id, { include: [{ model: Role, as: 'Role' }] });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  return passport;
};
