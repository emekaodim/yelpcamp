const express       = require("express");
const app           = express();
const bodyParser    = require("body-parser");
const mongoose      = require("mongoose");
const passport      = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const session = require("express-session");
const middleware = require("./middleware");

const commentRoutes    = require("./routes/comments"),
      campgroundRoutes = require("./routes/campground"),
      authRoutes       = require("./routes/index");

const User = require("./models/user");
const seedDB = require("./views/seeds");
const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

app.use(session({
  secret,
  resave: false,
  saveUninitialized: true,
}));


// Connect to MongoDB
const dbUrl = process.env.DATABASEURL 
// || "mongodb://localhost:27017/yelp_camp";

// mongoose.connect(dbUrl)
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });

// if (!process.env.DATABASEURL) {
//   throw new Error("DATABASEURL environment variable not set!");
// // }

// mongoose.connect(mongoose.connect("mongodb+srv://emekaodim1:Treasuretree1%40@yelpcamp.tfggvg6.mongodb.net/yelpcamp?retryWrites=true&w=majority")
// )
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error("MongoDB connection error:", err));

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://emekaodim1:<db_password>@yelpcamp.tfggvg6.mongodb.net/?retryWrites=true&w=majority&appName=yelpcamp";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


// Middleware
// seedDB();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));

// Passport configuration
app.use(
  session({
    secret: "King is key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Custom flash and currentUser middleware (combined)
app.use(middleware.flashMiddleware);

// Routes
app.use(campgroundRoutes);
app.use(authRoutes);
app.use(commentRoutes);

// Start server
const host = "localhost";
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
