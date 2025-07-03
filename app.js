const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const campground = require("./models/compounds")

const host = "localhost";
const port = 5000;

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Temporary in-memory data (used before DB)
// let campgrounds = [
//   {
//     name: "Aliz Ambrose Hotels",
//     image:
//       "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/14/99/07/cf/the-ambrose.jpg?w=1400&h=-1&s=1",
//   },
//   {
//     name: "Lagos Continental Hotels",
//     image:
//       "https://ik.imgkit.net/3vlqs5axxjf/external/https://media.iceportal.com/141209/photos/72581446_XL.jpg?tr=w-360%2Ch-379%2Cfo-auto",
//   },
//   {
//     name: "The Federal Palace Hotel",
//     image:
//       "https://wa-uploads.profitroom.com/federalpalace/608x608/17274444863358_.federalpalacepoolhotelexteriornight4591.jpg.sunimage.1920.900.webp",
//   },
//   {
//     name: "Transcorp Hilton Hotel",
//     image:
//       "https://i0.wp.com/www.transcorphotels.com/wp-content/uploads/2016/06/Transcorp_Hilton_Lagos_Photo.jpg?fit=1500%2C1000&ssl=1",
//   },
// ];

// Routes
app.get("/", (req, res) => {
  res.render("landingPage");
});

app.get("/campgrounds", async (req, res) => {
    try {
        const campgrounds = await Campground.find({});
        res.render("campgrounds", { campgrounds });
    } catch (err) {
        res.status(500).send("Something went wrong");
    }
});

//CREATE - ADD TO DATABASE
app.post("/campgrounds", async (req, res) => {
  const { name, image, description } = req.body;
  const newCampground = { name, image, description };

  try {
    await Campground.create(newCampground);
    res.redirect("/campgrounds");
  } catch (err) {
    console.error("Error saving campground:", err);
    res.status(500).send("Failed to save campground.");
  }
});

// NEW - SHOW FORM TO CREATE NEW CAMPGROUNDS
app.get("/campgrounds/new", (req, res) => {
  res.render("new.ejs");
});

app.get("/campgrounds/:id", async (req, res) => {
  try {
    const foundCampground = await Campground.findById(req.params.id);
    res.render("show", { campground: foundCampground });
  } catch (err) {
    console.error(err);
    res.status(500).send("Campground not found");
  }
});



// Start server
app.listen(port, host, () => {
  console.log("Listening on http://" + host + ":" + port);
});
