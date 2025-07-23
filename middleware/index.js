const Campground = require("../models/compounds"); // Ensure models are required
const Comment = require("../models/comments");

const middlewareObj = {};

// Middleware to check campground ownership
middlewareObj.checkCampgroundOwnership = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const campground = await Campground.findById(req.params.id);
      if (!campground) return res.status(404).send("Campground not found.");

      if (campground.author.id.equals(req.user._id)) {
        return next();
      } else {
        return res.status(403).send("You do not have permission to do that.");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error checking campground ownership.");
    }
  } else {
    return res.redirect("/login");
  }
};

// Middleware to check comment ownership
middlewareObj.checkCommentOwnership = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const comment = await Comment.findById(req.params.comment_id);
      if (!comment) return res.status(404).send("Comment not found.");

      if (comment.author.id.equals(req.user._id)) {
        return next();
      } else {
        return res.status(403).send("Permission denied.");
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Error checking comment ownership.");
    }
  } else {
    return res.redirect("/login");
  }
};

// Middleware to check if user is logged in
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

module.exports = middlewareObj;
