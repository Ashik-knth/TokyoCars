const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/usermodel");
require("dotenv").config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRETE,
    callbackURL: "http://tokyocars.shop/google/callback"
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await User.findOne({ googleId: profile.id });
            if (user) {
                return done(null, user);
            } else {
                const newUser = new User({
                    username: profile.displayName,
                    email: profile.emails[0].value,
                    googleId: profile.id,
                });
                await newUser.save();
                // Remove the req.session line as req is not available here
                return done(null, newUser);
            }
        } catch (error) {
            return done(error, null);
        }
    }));

// User Data Assign to Session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// User Data Fetch from Session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});



    
  module.exports = passport;


