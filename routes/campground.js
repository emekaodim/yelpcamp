const express = require("express");
const router = express.Router();
const Campground = require("../models/compounds");
const middleware = require("../middleware");

// INDEX - Show all campgrounds
router.get("/campgrounds", async (req, res) => {
  try {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong.");
  }
});

// NEW - Show form to create new campground
router.get("/campgrounds/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});

// CREATE - Add new campground to database
router.post("/campgrounds", middleware.isLoggedIn, async (req, res) => {
  const { name, image, price, description } = req.body;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };

  const newCampground = { name, image, price, description, author };

  try {
    await Campground.create(newCampground);
    res.redirect("/campgrounds");
  } catch (err) {
    console.error("Error saving campground:", err);
    res.status(500).send("Failed to save campground.");
  }
});

// SHOW - Show info about one campground
router.get("/campgrounds/:id", async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id)
      .populate("comments")
      .exec();

    if (!foundCampground) {
      return res.status(404).send("Campground not found.");
    }

    res.render("campgrounds/show", {
      campground: foundCampground,
      currentUser: req.user
    });
  } catch (err) {
    console.error("Error retrieving campground:", err);
    res.status(500).send("Server error.");
  }
});

// EDIT - Show form to edit campground
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      return res.status(404).send("Campground not found.");
    }
    res.render("campgrounds/edit", { campground });
  } catch (err) {
    console.error("Error loading edit form:", err);
    res.status(500).send("Failed to load edit form.");
  }
});

// UPDATE - Save changes to campground
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, async (req, res) => {
  const { name, image, price, description } = req.body;

  try {
    await Campground.findByIdAndUpdate(req.params.id, {
      name,
      image,
      price,
      description
    });
    res.redirect(`/campgrounds/${req.params.id}`);
  } catch (err) {
    console.error("Error updating campground:", err);
    res.status(500).send("Failed to update campground.");
  }
});

// DELETE - Delete campground
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, async (req, res) => {
  try {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect("/campgrounds");
  } catch (err) {
    console.error("Error deleting campground:", err);
    res.status(500).send("Failed to delete campground.");
  }
});

module.exports = router;
