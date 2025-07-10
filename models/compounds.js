const mongoose = require("mongoose");
require("./comments"); // This ensures the Comment model is registered

async function main() {
  await mongoose.connect("mongodb://localhost:27017/yelpcamp");

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
        ref: "Comment"
      }
    ]
  });

  // Define the model
  const Campground = mongoose.model("Campground", campgroundSchema);

  // Create a new campground (optional: wrap in a check to avoid duplicates)
  try {
    const newCamp = await Campground.create({
      name: "Lagos Continental Hotels",
      image:
        "https://ik.imgkit.net/3vlqs5axxjf/external/https://media.iceportal.com/141209/photos/72581446_XL.jpg?tr=w-360%2Ch-379%2Cfo-auto",
      description:
        "The Lagos Continental Hotel, is a 5-Star Hotel located at Plot 52A, Kofo Abayomi Street, Victoria Island, within the heart of the central business district of Lagos Nigeria. Our prime location makes the Hotel ideal for both business and leisure stays."
    });

    console.log("Newly Created Campground:");
    console.log(newCamp);
  } catch (err) {
    console.error("Error creating campground:", err);
  }

  global.Campground = Campground;
  module.exports = Campground;
}

main();
