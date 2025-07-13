const mongoose = require("mongoose");

// Schema setup
const campgroundSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  image: String,
  description: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

// Export the model
module.exports = mongoose.model("/Campground", campgroundSchema);
