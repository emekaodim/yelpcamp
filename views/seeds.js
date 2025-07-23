const mongoose = require("mongoose");
const Campground = require("../models/compounds");
const Comment = require("../models/comments");

async function seedDB() {
  await Campground.deleteMany({});
  const camp = await Campground.create({
    name: "Lagos Continental Hotels",
    image:
      "https://ik.imgkit.net/3vlqs5axxjf/external/https://media.iceportal.com/141209/photos/72581446_XL.jpg?tr=w-360%2Ch-379%2Cfo-auto",
    description: "Luxury hotel in Victoria Island, Lagos.",
  });

  const comment = await Comment.create({
    text: "Amazing location and beautiful view!",
    author: "John Doe",
  });

  camp.comments.push(comment);
  await camp.save();
  console.log("Database seeded!");
}

module.exports = seedDB;
