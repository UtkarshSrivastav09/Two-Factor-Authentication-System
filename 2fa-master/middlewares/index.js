const User = require("../models/user");

module.exports =  {
    // User must be logged in
    isLoggedIn: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect("/login");
        }
    },

    // Check if 2FA is enabled and NOT authenticated
    isTfa: (req, res, next) => {
        User.findById(req.user._id).then((rUser) => {
            if (rUser.tfa && !rUser.secret_key.authenticated) {
                // User has 2FA ON but has NOT verified OTP → send to verification page
                return res.redirect("/verification/tfa");
            }
            next(); // Continue to next middleware (dashboard)
        });
    },

    // Protect dashboard – user must be authenticated with 2FA
    ensureTfa: (req, res, next) => {
        User.findById(req.user._id).then((rUser) => {
            if (rUser.tfa) {
                if (rUser.secret_key.authenticated) {
                    // Already authenticated by OTP → allow dashboard
                    return next();
                } else {
                    // 2FA enabled but no OTP yet
                    return res.redirect("/verification/tfa");
                }
            } else {
                // 2FA disabled → allow dashboard
                next();
            }
        });
    }
};
