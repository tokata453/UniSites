// config/passport.js
// Passport OAuth configuration with Google, Facebook, and GitHub strategies

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { User } = require('../models');

// ═══════════════════════════════════════════════════════════
// SERIALIZE/DESERIALIZE USER
// ═══════════════════════════════════════════════════════════

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ═══════════════════════════════════════════════════════════
// GOOGLE OAUTH STRATEGY
// ═══════════════════════════════════════════════════════════

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Google ID
        let user = await User.findOne({ where: { googleId: profile.id } });

        if (user) {
          // User exists - return it
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({
          where: { email: profile.emails[0].value }
        });

        if (user) {
          // Email exists - link Google account
          user.googleId = profile.id;
          user.provider = 'google';
          if (!user.avatar && profile.photos && profile.photos[0]) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name.givenName || profile.displayName.split(' ')[0],
          lastName: profile.name.familyName || profile.displayName.split(' ')[1] || '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          provider: 'google',
          isActive: true,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random password
        });

        done(null, user);
      } catch (error) {
        console.error('Google OAuth error:', error);
        done(error, null);
      }
    }
  )
);

// ═══════════════════════════════════════════════════════════
// FACEBOOK OAUTH STRATEGY
// ═══════════════════════════════════════════════════════════

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists with this Facebook ID
        let user = await User.findOne({ where: { facebookId: profile.id } });

        if (user) {
          return done(null, user);
        }

        // Check if user exists with same email
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        
        if (email) {
          user = await User.findOne({ where: { email } });

          if (user) {
            // Link Facebook account
            user.facebookId = profile.id;
            user.provider = 'facebook';
            if (!user.avatar && profile.photos && profile.photos[0]) {
              user.avatar = profile.photos[0].value;
            }
            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        user = await User.create({
          facebookId: profile.id,
          email: email || `facebook_${profile.id}@temp.com`, // Fallback if no email
          firstName: profile.name.givenName || profile.displayName.split(' ')[0],
          lastName: profile.name.familyName || profile.displayName.split(' ')[1] || '',
          avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
          provider: 'facebook',
          isActive: true,
          password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8),
        });

        done(null, user);
      } catch (error) {
        console.error('Facebook OAuth error:', error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;