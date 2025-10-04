require("dotenv").config(); // Load environment variables

const express        = require("express");
const app            = express();
const bodyParser     = require("body-parser");
const mongoose       = require("mongoose");
const passport       = require("passport");
const LocalStrategy  = require("passport-local");
const methodOverride = require("method-override");
const session        = require("express-session");
const middleware     = require("./middleware");

// Routes
const commentRoutes    = require("./routes/comments");
const campgroundRoutes = require("./routes/campground");
const authRoutes       = require("./routes/index");

// Models
const User   = require("./models/user");
const seedDB = require("./views/seeds"); // Optional for seeding test data

// =======================
// Database Configuration
// =======================
const dbUrl = process.env.DATABASEURL || "mongodb://127.0.0.1:27017/yelp_camp";

mongoose.connect(dbUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// =======================
// App Configuration
// =======================
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// Session & Passport setup
app.use(session({
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// =======================
// Custom Middleware
// =======================
app.use(middleware.flashMiddleware);

// =======================
// Routes
// =======================
app.use(campgroundRoutes);
app.use(authRoutes);
app.use(commentRoutes);

// =======================
// Start Server
// =======================
const host = "localhost"; // use "0.0.0.0" for production
const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running at port ${port}`);
});

