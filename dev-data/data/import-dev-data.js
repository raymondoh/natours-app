const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
//dotenv.config({ path: `${__dirname}/../../config.env` });
dotenv.config({ path: `${__dirname}/config.env` });

const Tour = require('../../controllers/tourController');

const DB = process.env.DATABASE_CONNECTION.replace(
  '<DATABASE_PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

//IMPORT DATA INTO DB
const importData = async (req, res) => {
  try {
    await Tour.createTour(tours);
    console.log('Data successfully loaded');
    if (res.status === undefined) {
      console.log('it sucks');
    } else {
      res.status(201).json({
        status: 'success',
        message: 'Yeah',
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
      status: 'fail',
      message: 'Nooo',
    });
    console.log('Data successfully deleted');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
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
