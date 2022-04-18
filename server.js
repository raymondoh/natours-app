const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoSanitize = require("express");
const xss = require("xss-clean");
const hpp = require("hpp");
const AppError = require("./middleware/appError");
const globalErrorHandler = require("./controllers/errorController");
// 1 ROUTE HANDLERS import routers + middleware
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");

const app = express();
//console.log(process.env.NODE_ENV);
// db
const connectDB = require("./db/connect");

//1 - GLOBAL MIDDLEWARES
//Set security HTTP Headers
app.use(helmet());
// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// limit requests from same api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: "Too many requests from this IP. Please try again in an hour"
});
app.use("/api", limiter);
// Body parser - reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
// Data sanitization against NoSQL query injections
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"]
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// 4 - ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 5 - ERROR ROUTES MIDDLEWARE
app.use(globalErrorHandler);

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
