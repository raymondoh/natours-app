const dotenv = require("dotenv");
dotenv.config();
const express = require("express");

const AppError = require("./middleware/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

console.log(process.env.NODE_ENV);

// db
const connectDB = require("./db/connect");

// 1 ROUTE HANDLERS import routers + middleware

const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const authRouter = require("./routes/authRoutes");

app.use(express.json());
const morgan = require("morgan");
app.use(express.static(`${__dirname}/public`));
//1 - MIDDLEWARES middleware imports + use()
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 4 - ROUTE HANDLERS ALL ROUTES
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// 5 - ERROR ROUTES MIDDLEWARE
app.use(globalErrorHandler);

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
