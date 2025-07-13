const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Campground = require("./models/compounds"); // Check this filename!
const Comment = require("./models/comments");
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
// seedDB(); // Optional: seeds the DB with test data
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// ROUTES

// Landing page
app.get("/", (req, res) => {
  res.render("landingPage"); // views/landingPage.ejs
});

// INDEX - List all campgrounds
app.get("/campgrounds", async (req, res) => {
  try {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds }); // Ensure views/campgrounds/index.ejs exists
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
});

// NEW - Show form to create campground
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// CREATE - Add new campground to DB
app.post("/campgrounds", async (req, res) => {
  const { name, image, description } = req.body;
  const newCampground = { name, image, description };

  try {
    await Campground.create(newCampground);
    res.redirect("/campgrounds"); // ✅ Corrected path
  } catch (err) {
    console.error("Error saving campground:", err);
    res.status(500).send("Failed to save campground.");
  }
});

// SHOW - Show more info about one campground
app.get("/campgrounds/:id", async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id)
      .populate("comments")
      .exec();

    if (!foundCampground) {
      console.warn("Campground not found for ID:", req.params.id);
      return res.status(404).send("Campground not found.");
    }

    res.render("campgrounds/show", { campground: foundCampground }); // views/campgrounds/show.ejs
  } catch (err) {
    console.error("Error retrieving campground:", err);
    res.status(500).send("Server error.");
  }
});

// NEW COMMENT - Show form to add comment
app.get("/campgrounds/:id/comments/new", async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    res.render("comments/new", { campground });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading comment form.");
  }
});

// CREATE COMMENT - Add new comment to campground
app.post("/campgrounds/:id/comments", async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    const comment = await Comment.create(req.body.comment);
    campground.comments.push(comment);
    await campground.save();
    res.redirect("/campgrounds/" + campground._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add comment.");
  }
});

// Start server
const host = "localhost";
const port = 5000;
app.listen(port, host, () => {
  console.log("Listening on http://" + host + ":" + port);
});

