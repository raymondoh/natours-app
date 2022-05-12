const mongoose = require("mongoose");
const Tour = require("./TourModel");

const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Please enter a review"]
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A review must belong to a tour"]
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A review must be from a user"]
    }
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false }
);
// unique reviews
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// ReviewSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "user",
//     select: "name photo"
//   }).populate({
//     path: "tour",
//     select: "name"
//   }),
//     next();
// });

ReviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo"
  });
  next();
});

// calculate average rating
ReviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" }
      }
    }
  ]);
  // persist rating and avg rating to db
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// save Review stats each time Review is created middleware
ReviewSchema.post("save", function () {
  // post action doesnt get access to next so sont use it here
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

module.exports = mongoose.model("Review", ReviewSchema);
