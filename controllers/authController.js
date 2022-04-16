const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser
    }
  });
});

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1 check email password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // 2 check user exists & password correct
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  // compare passwords

  if (!user || !(await user.comparePasswords(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // if all ok, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token
  });
});

const protectedRoute = catchAsync(async (req, res, next) => {
  // 1 - CHECK TOKEN EXISTS
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  //console.log(token);

  if (!token) {
    next(new AppError("Authentication failed - you are not logged in, Please log in to get access", 401));
  }
  // 2 VERIFY TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log("DECODED!", decoded);

  // 3 - CHECK USER STILL EXISTS
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("The user belonging to this token no longer exists", 401));
  }

  // 4 - CHECK IF USER CHANGED PASSWORD AFTER TOKEN WAS ISSUED
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("User recently changed password. Please log in again", 401));
  }
  freshUser.changedPasswordAfter(decoded.iat);

  // 5 - GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      new AppError("you do not have access to perform this action", 403);
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  // 1 get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no user with that email address", 404));
  }

  // 2 Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3 send token to users email
});

const resetPassword = catchAsync(async (req, res, next) => {});

module.exports = {
  signup,
  login,
  protectedRoute,
  restrictTo,
  forgotPassword,
  resetPassword
};
