const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("./../utils/email");

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    //secure: true,
    httpOnly: true
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  // remove password from output
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user
    }
  });
};

const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

const protectedRoute = catchAsync(async (req, res, next) => {
  // 1 - CHECK TOKEN EXISTS
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  console.log(token);

  if (!token) {
    next(new AppError("Authentication failed - you are not logged in, Please log in to get access", 401));
  }
  // 2 VERIFY TOKEN
  //const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
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
  // get user
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with that email", 404));
  }

  // generate random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // send it to users email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/auth/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Your password reset token (valid for 10mins)`,
      message
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email"
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error sending the email. Try again later!", 500));
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  console.log("req.body:".req.params);
  // 1) Get user based on the token
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

const updatePassword = catchAsync(async (req, res, next) => {
  // 1 - get user from collection
  const user = await User.findById(req.user.id).select("password");

  // 2 - check if posted current passsord is correct
  if (!(await user.comparePasswords(req.body.passwordCurrent, user.password))) {
    return next(new AppError("your current password is wrong", 401));
  }

  // 3 - if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //user.findById&Update() wont work

  // 4 - log user in, send jwt
  createSendToken(user, 200, res);
});

module.exports = {
  signup,
  login,
  protectedRoute,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword
};
