const express       = require("express");
const app           = express();
const bodyParser    = require("body-parser");
const mongoose      = require("mongoose");
const passport      = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const session = require("express-session");
const middleware = require("./middleware");

const commentRoutes    = require("./routes/comments"),
      campgroundRoutes = require("./routes/campground"),
      authRoutes       = require("./routes/index");

const User = require("./models/user");
const seedDB = require("./views/seeds");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/yelp_camp");
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Middleware
// seedDB();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// Passport configuration
app.use(
  session({
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

// ✅ Custom flash and currentUser middleware (combined)
app.use(middleware.flashMiddleware);

// Routes
app.use(campgroundRoutes);
app.use(authRoutes);
app.use(commentRoutes);

// Start server
const host = "localhost";
const port = 5000;
app.listen(port, host, () => {
  console.log("Listening on http://" + host + ":" + port);
});
