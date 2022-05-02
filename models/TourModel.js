const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const User = require("./UserModel");

const TourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter a name"],
      unique: true,
      trim: true,
      maxlength: [41, "Tour name must be less than 40 characters in length"],
      minlength: [10, "Tour name must be more than 10 characters in length"],
      //validate: [validator.isAlpha, "Tour name must be letters only"],
      validate: {
        validator: function (value) {
          return validator.isAlpha(value.split(" ").join(""));
        },
        message: "Tour name must only contain characters."
      }
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, "please enter tour duration"]
    },
    secretTour: {
      type: Boolean,
      default: false
    },
    maxGroupSize: {
      type: Number,
      required: [true, "please enter max group size"]
    },
    difficulty: {
      type: String,
      required: [true, "please enter tour difficulty"],
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Please choose either easy, medium or difficult"
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "rating must be above 1.0"],
      max: [5, "rating must be below 5.1"]
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    tourSummary: {
      type: String,
      trim: true,
      required: [true, "please enter tour summary"]
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, "please upload cover image"]
    },
    images: [String],
    price: {
      type: Number,
      required: [true, "please enter a price"]
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // only works on current docs being created
          return val < this.price;
        },
        message: "discount can't be more than the price (${VALUE})"
      }
    },
    startDates: [Date],
    startLocation: {
      type: {
        type: String,
        default: "Point",
        enum: ["Point"]
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"]
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false }
);

// DURATION MIDDLEWARE
TourSchema.virtual("durationWeeks").get(function () {
  if (this.duration) {
    return this.duration / 7;
  }
});
// DOCUMENT MIDDLEWARE, RUND BEFORE SAVE() AND CREATE(). DOESN'T WORK ON INSERTMANY()
//pre save hook
TourSchema.pre("save", function (next) {
  //console.log(this); what the doc looks like before save/slugify
  this.slug = slugify(this.name, { lower: true });
  next();
});

// embedding
// TourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });
/*
// pre save hook
TourSchema.pre("save", function () {
  console.log("saving document...");
  next();
});
// post save hook
TourSchema.post("save", function (doc, next) {
  console.log(this); //what the doc looks like after
  next();
});
*/

// QUERY MIDDLEWARE - runs before find() query - acts on query NOT document
// TourSchema.pre('find', function(next) {
TourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});
TourSchema.post(/^find/, function (docs, next) {
  //console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});
// AGGREGATION MIDDLEWARE
TourSchema.pre("aggregate", function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

  console.log(this.pipeline());
  next();
});
module.exports = mongoose.model("Tour", TourSchema);
