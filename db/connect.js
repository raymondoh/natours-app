const mongoose = require("mongoose");

// coonectDB method returns promise, must set up async/await in server
const connectDB = url => {
  return mongoose.connect(url);
  console.log("fff");
};

module.exports = connectDB;
