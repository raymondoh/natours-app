const User = require("../models/UserModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const factory = require("./handlerFactory");

const getAllUsers = factory.getAll(User);
const getUser = factory.getOne(User);
const deleteUser = factory.deleteOne(User);
const updateUser = factory.updateOne(User);

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// @desc    Get All users
// @route   GET /api/v1/users
// @access  Public
const getAllUsers1 = catchAsync(async (req, res) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users
    }
  });
});

// @desc    Create User
// @route   POST /api/v1/users
// @access  Private
const createUser = (req, res) => {
  res.status(500).json({
    status: "fail",
    message: "This route is not defined. Please use sign up instead"
  });
};

// @desc    Get User
// @route   GET /api/v1/users/:id
// @access  Public
const getUser1 = (req, res) => {
  res.send("get user");
};

// @desc    Update User
// @route   PATCH /api/v1/users/:id
// @access  PRIVATE
const updateUser1 = (req, res) => {
  res.send("update user");
};

// @desc    Delete User
// @route   DELETE /api/v1/users/:id
// @access  PRIVATE

const deleteUser1 = (req, res) => {
  res.send("delete user");
};

const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
// @desc    Update User
// @route   UPDATE /api/v1/users/:id
// @access  PRIVATE
const updateMe = catchAsync(async (req, res, next) => {
  // 1 - create error if user posts password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError("This route is not for password updates. Please use update my password", 400));
  }
  // 2 - filtered out unwanted field names that arent allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");
  //console.log(filteredBody);
  // 3 - if not, update user doc
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });
  if (updatedUser) {
    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser
      }
    });
  } else {
    //console.log("oh shit");
    res.status(401).json({
      status: "fail",
      message: "shit shit"
    });
  }
});

const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null
  });
});

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe
};
