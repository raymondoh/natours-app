/*const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
//dotenv.config({ path: `${__dirname}/../../config.env` });
dotenv.config({ path: `${__dirname}/config.env` });
const connectDB = require("../../db/connect");

const Tour = require("../../controllers/tourController");

const DB = process.env.DATABASE_CONNECTION;

// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true
//   })
//   .then(() => console.log("DB connection successful!"));

const port = process.env.PORT || 3001;
// start app - spin up server if successful, will only start if connection to mongo db successful
const start = async () => {
  try {
    await connectDB(process.env.DATABASE_CONNECTION);
    app.listen(port, () => {
      console.log(`server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

//IMPORT DATA INTO DB
const importData = async (req, res) => {
  try {
    await Tour.createTour(tours);
    console.log("Data successfully loaded");
    if (res.status === undefined) {
      console.log("it sucks");
    } else {
      res.status(201).json({
        status: "success",
        message: "Yeah"
      });
    }
  } catch (error) {
    console.log(error);
  }
  process.exit();
};
//DELETE DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    res.status(201).json({
      status: "fail",
      message: "Nooo"
    });
    console.log("Data successfully deleted");
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}

/*
const tours = require('./tours-simple.json');

// IMPORT DATA INTO DATABASE

const importData = async () => {
  await Tour.createTour(tours);
  console.log('Data succesfully loaded');
};

// DELETE ALL DATA FROM COLLECTION

const deleteData1 = async () => {
  await Tour.deleteMany();
  console.log('Data succesfully deleted');
};

(async () => {
  try {
    await mongoose.connect(DB, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    if (process.argv[2] === '--delete') {
      await deleteData();
    } else if (process.argv[2] == '--import') {
      await importData();
    } else {
      console.log("Please specify '--import' or '--delete'");
    }
    await mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
})();
*/

const fs = require("fs");
const mongoose = require("mongoose");
//const dotenv = require("dotenv");
const Tour = require("../../models/TourModel");
//const Review = require("./../../models/reviewModel");
//const User = require("./../../models/userModel");

//dotenv.config({ path: "./config.env" });
const connectDB = require("../../db/connect");
//const DB = process.env.DATABASE_CONNECTION;

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

// DB SERVER CONNECTION
const port = process.env.PORT || 3001;
// start app - spin up server if successful, will only start if connection to mongo db successful
const start = async () => {
  try {
    await connectDB(process.env.DATABASE_CONNECTION);
    app.listen(port, () => {
      console.log(`server is listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await connectDB(process.env.DATABASE_CONNECTION);
    await Tour.create(tours);
    //await User.create(users, { validateBeforeSave: false });
    //await Review.create(reviews);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
