const Review = require("../models/ReviewModel");
const Tour = require("../models/TourModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const getAllReviews = factory.getAll(Review);
const createReview = factory.createOne(Review);
const getReview = factory.getOne(Review);
const deleteReview = factory.deleteOne(Review);
const updateReview = factory.updateOne(Review);

// @desc    Get All reviews
// @route   GET /api/v1/tours/:tourId/reviews
// @access  Public
const getAllReviews1 = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews
    }
  });
});

const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

// @desc    Create Review
// @route   POST /api/v1/tours/:tourId/reviews
// @access  Private
const createReview1 = catchAsync(async (req, res, next) => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      review: newReview
    }
  });
});

module.exports = {
  getReview,
  getAllReviews,
  createReview,
  setTourUserIds,
  deleteReview,
  updateReview
};
