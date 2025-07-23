const express = require("express");
const router = express.Router({ mergeParams: true });
const Campground = require("../models/compounds");
const Comment = require("../models/comments");
const middleware = require("../middleware");



// NEW - Show form to create a new comment
router.get("/campgrounds/:id/comments/new", middleware.isLoggedIn, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) return res.status(404).send("Campground not found.");
    res.render("comments/new", { campground });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading comment form.");
  }
});

// CREATE - Add new comment to DB
router.post("/campgrounds/:id/comments",  middleware.isLoggedIn, async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) return res.status(404).send("Campground not found.");
    
    const comment = await Comment.create(req.body.comment);
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    await comment.save();
    
    campground.comments.push(comment);
    await campground.save();
    
    res.redirect("/campgrounds/" + campground._id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add comment.");
  }
});

// EDIT - Show edit form for a comment
router.get("/campgrounds/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.comment_id);
    if (!comment) return res.status(404).send("Comment not found.");
    
    res.render("comments/edit", { campground_id: req.params.id, comment });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load edit form.");
  }
});

// UPDATE - Update the comment in the DB
router.put("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment);
    res.redirect("/campgrounds/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update comment.");
  }
});

// DELETE - Remove comment from DB
router.delete("/campgrounds/:id/comments/:comment_id", middleware.checkCommentOwnership, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.comment_id);
    res.redirect("/campgrounds/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete comment.");
  }
});

module.exports = router;
