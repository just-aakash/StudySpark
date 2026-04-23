import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/user.js';

// ─── Google ───────────────────────────────────────────────────────────────────
passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), null);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fname:      profile.name?.givenName  || profile.displayName || 'User',
        lname:      profile.name?.familyName || 'Unknown',
        email,
        password:   'oauth_placeholder_' + Math.random().toString(36).slice(2),
        profilePic: profile.photos?.[0]?.value,
        authProvider: 'google',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// ─── GitHub ───────────────────────────────────────────────────────────────────
passport.use(new GitHubStrategy({
  clientID:     process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL:  '/api/auth/github/callback',
  scope: ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.username}@github.local`;
    let user = await User.findOne({ email });
    const [fname, ...rest] = (profile.displayName || profile.username || 'User').split(' ');
    if (!user) {
      user = await User.create({
        fname:      fname || 'User',
        lname:      rest.join(' ') || 'Unknown',
        email,
        password:   'oauth_placeholder_' + Math.random().toString(36).slice(2),
        profilePic: profile.photos?.[0]?.value,
        authProvider: 'github',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

// ─── LinkedIn ─────────────────────────────────────────────────────────────────
passport.use(new LinkedInStrategy({
  clientID:     process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL:  '/api/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from LinkedIn'), null);

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        fname:      profile.name?.givenName  || 'User',
        lname:      profile.name?.familyName || 'Unknown',
        email,
        password:   'oauth_placeholder_' + Math.random().toString(36).slice(2),
        profilePic: profile.photos?.[0]?.value,
        authProvider: 'linkedin',
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

export default passport;
