const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// LANDING PAGE
router.get("/", (req, res) => {
  res.render("landingPage");
});

// ========== AUTH ROUTES ==========

// REGISTER FORM
router.get("/register", (req, res) => {
  res.render("register");
});

// REGISTER LOGIC
router.post("/register", async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username });
    await User.register(newUser, req.body.password);

    req.flash("success", `Welcome to YelpCamp, ${newUser.username}!`);
    passport.authenticate("local")(req, res, () => {
      res.redirect("/campgrounds");
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Registration failed: " + err.message);
    res.redirect("/register");
  }
});

// LOGIN FORM
router.get("/login", (req, res) => {
  res.render("login");
});

// LOGIN LOGIC
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err || !user) {
      req.flash("error", "Invalid username or password.");
      return res.redirect("/login");
    }

    req.logIn(user, (err) => {
      if (err) {
        req.flash("error", "Login error.");
        return res.redirect("/login");
      }

      req.flash("success", `Welcome back, ${user.username}!`);
      return res.redirect("/campgrounds");
    });
  })(req, res, next);
});

// LOGOUT
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.flash("success", "Logged you out.");
    res.redirect("/campgrounds");
  });
});

module.exports = router;
