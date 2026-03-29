const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { google } = require('./env');
const UserModel = require('../models/user.model');

passport.use(
  new GoogleStrategy(
    {
      clientID: google.clientId,
      clientSecret: google.clientSecret,
      callbackURL: google.callbackUrl,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await UserModel.findByEmail(email);

        if (!user) {
          // Auto-register new OAuth user as employee (admin assigns role later)
          user = await UserModel.createOAuthUser({
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value || null,
            googleId: profile.id,
          });
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
    const user = await UserModel.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;