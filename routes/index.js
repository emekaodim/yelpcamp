const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

// ROUTES

router.get("/", (req, res) => {
  res.render("landingPage");
});

// AUTH ROUTES
router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/register", async (req, res) => {
  try {
    const newUser = new User({ username: req.body.username });
    await User.register(newUser, req.body.password);
    passport.authenticate("local")(req, res, () => {
      res.redirect("/campgrounds");
    });
  } catch (err) {
    console.error(err);
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/campgrounds",
  failureRedirect: "/login"
}));

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/campgrounds");
  });
});


module.exports = router; 