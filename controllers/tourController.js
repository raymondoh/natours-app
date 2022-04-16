const Tour = require("../models/TourModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// @desc    Get All Tours
// @route   GET /api/v1/tours
// @access  Public
const getAllTours = catchAsync(async (req, res, next) => {
  //console.log(req.body);
  //console.log(req.query);
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
  const tours = await features.query;
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours
    }
  });
});

// @desc    Create Tour
// @route   POST /api/v1/tours
// @access  Private
const createTour = catchAsync(async (req, res, next) => {
  // 1 - use the data coming in from the body
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      tour
    }
  });
});

// const createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: "success",
//     data: {
//       tour: newTour
//     }
//   });
// });

// @desc    Get Tour
// @route   GET /api/v1/tours/:id
// @access  Public
// findById(req.params.id) shorthand for === findOne({_id: req.params.id})
const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      tour
    }
  });
});

// @desc    Update Tour
// @route   PATCH /api/v1/tours/:id
// @access  PRIVATE
const updateTour = catchAsync(async (req, res, next) => {
  //3 paramaters = 1, id, 2 - data we want to change 3  options object
  // findOneAndUpdate shorthand for findByIdAndUpdate
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updatedTour) {
    return next(new AppError("No tour found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedTour
    }
  });
});

// @desc    Delete Tour
// @route   DELETE /api/v1/tours/:id
// @access  PRIVATE
const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError("No tour found with that ID", 404));
  }
  tour.remove();

  res.status(204).json({
    status: "success",
    message: "tour deleted"
  });
});

const aliasTopTours = async (req, res, next) => {
  req.query.limit = "3";
  (req.query.sort = "-ratingsAverage, price"), (req.query.fields = "name, price, ratingsAverage, summary, difficulty");
  next();
};

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        // _id: null,
        _id: { $toUpper: "$difficulty" },
        //_id: "$ratingsAverage",
        numTours: { $sum: 1 },
        numRating: { $sum: "$ratingsQuantity" },
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: "$price" },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: "$EASY" } }
    // }
  ]);
  res.status(200).json({
    status: "success",
    message: "stats details",
    data: {
      stats
    }
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: "$startDates"
    },
    {
      $match: {
        startdates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numTourStarts: { $sum: 1 },
        tours: { $push: "$name" }
      }
    },
    {
      $addFields: { month: "$_id" }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: "success",
    data: plan
  });
});

module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
};
