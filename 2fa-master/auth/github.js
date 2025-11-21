require("dotenv").config(); // Make sure environment variables load

const User = require("../models/user");
const passport = require("passport");
const GitHubStrategy = require("passport-github").Strategy;

// Validate required environment variables
if (!process.env.GITHUB_ID || !process.env.GITHUB_SECRET) {
    console.error("❌ ERROR: Missing GitHub OAuth ENV variables");
    console.error("Please add GITHUB_ID and GITHUB_SECRET to your .env file.");
    process.exit(1);
}

// Use ENV callback if present, otherwise default
const CALLBACK_URL =
    process.env.GITHUB_CALLBACK_URL ||
    "http://127.0.0.1:5000/auth/github/callback";

// Configure strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            callbackURL: CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                let existingUser = await User.findOne({ githubId: profile.id });

                if (!existingUser) {
                    const newUser = new User({
                        username: profile.username,
                        githubId: profile.id,
                    });

                    await newUser.save();
                    return cb(null, newUser);
                } else {
                    return cb(null, existingUser);
                }
            } catch (err) {
                return cb(err);
            }
        }
    )
);

module.exports = passport;
