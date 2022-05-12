const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config({ path: ".env" });

// Load models
const Tour = require("./models/TourModel");
const User = require("./models/UserModel");
const Review = require("./models/ReviewModel");

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Read JSON FILES
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/reviews.json`, "utf-8"));

// Import into DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log("Data imported...".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data destroyed...".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === "-import") {
  importData();
} else if (process.argv[2] === "-delete") {
  deleteData();
}

// command: node seeder -import
// command: node seeder -delete
