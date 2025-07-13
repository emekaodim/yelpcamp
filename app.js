// app.js
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");

const Campground = require("./models/compounds");
const Comment = require("./models/comments");
const User = require("./models/user");
const seedDB = require("./seeds");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/yelp_camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Middleware
// seedDB();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Passport configuration
app.use(
  require("express-session")({
    secret: "King is key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Current user to all views
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ROUTES

app.get("/", (req, res) => {
  res.render("landingPage");
});

app.get("/campgrounds", async (req, res) => {
  try {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
});

app.get("/campgrounds/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", isLoggedIn, async (req, res) => {
  const { name, image, description } = req.body;
  const newCampground = { name, image, description };
  try {
    await Campground.create(newCampground);
    res.redirect("/campgrounds");
  } catch (err) {
    console.error("Error saving campground:", err);
    res.status(500).send("Failed to save campground.");
  }
});

app.get("/campgrounds/:id", async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id)
      .populate("comments")
      .exec();

    if (!foundCampground) {
      return res.status(404).send("Campground not found.");
    }

    res.render("campgrounds/show", { campground: foundCampground });
  } catch (err) {
    console.error("Error retrieving campground:", err);
    res.status(500).send("Server error.");
  }
});

// Comments - only accessible to logged in users
app.get("/campgrounds/:id/comments/new", isLoggedIn, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) return res.status(404).send("Campground not found.");
    res.render("comments/new", { campground });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading comment form.");
  }
});

app.post("/campgrounds/:id/comments", isLoggedIn, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) return res.status(404).send("Campground not found.");
    const comment = await Comment.create(req.body.comment);
    campground.comments.push(comment);
    await campground.save();
    res.redirect("/campgrounds/" + campground._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add comment.");
  }
});

// AUTH ROUTES
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
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

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/campgrounds",
  failureRedirect: "/login"
}));

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/campgrounds");
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

const host = "localhost";
const port = 5000;
app.listen(port, host, () => {
  console.log("Listening on http://" + host + ":" + port);
});
