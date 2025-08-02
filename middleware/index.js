const Campground = require("../models/compounds");
const Comment = require("../models/comments");

const middlewareObj = {};

// ✅ Middleware: Check if user owns the campground
middlewareObj.checkCampgroundOwnership = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const campground = await Campground.findById(req.params.id);
      if (!campground) return res.status(404).send("Campground not found.");

      if (campground.author.id.equals(req.user._id)) {
        return next();
      } else {
        req.flash("error", "You do not have permission to do that.");
        return res.redirect("back");
      }
    } catch (err) {
      console.error(err);
      req.flash("error", "An error occurred.");
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Please login first.");
    return res.redirect("/login");
  }
};

// ✅ Middleware: Check if user owns the comment
middlewareObj.checkCommentOwnership = async (req, res, next) => {
  if (req.isAuthenticated()) {
    try {
      const comment = await Comment.findById(req.params.comment_id);
      if (!comment) return res.status(404).send("Comment not found.");

      if (comment.author.id.equals(req.user._id)) {
        return next();
      } else {
        req.flash("error", "Permission denied.");
        return res.redirect("back");
      }
    } catch (err) {
      console.error(err);
      req.flash("error", "An error occurred.");
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Please login first.");
    return res.redirect("/login");
  }
};

// ✅ Middleware: Check if user is logged in
middlewareObj.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please login first");
  res.redirect("/login");
};

middlewareObj.flashMiddleware = (req, res, next) => {
  // Make the current user available to all templates
  res.locals.currentUser = req.user;

  // Attach flash messages to res.locals for template access
  res.locals.flash = req.session.flash;
  delete req.session.flash;

  // Custom req.flash function
  req.flash = (type, message) => {
    req.session.flash = { [type]: message };
  };

  next();
};

module.exports = middlewareObj;
