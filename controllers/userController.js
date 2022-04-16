//const users = require("../dev-data/data/users-simple.json");

// @desc    Get All users
// @route   GET /api/v1/users
// @access  Public
const getAllUsers = (req, res) => {
  res.send("get all users");
};

// @desc    Create User
// @route   POST /api/v1/users
// @access  Private
const createUser = (req, res) => {
  res.send("create user");
};

// @desc    Get User
// @route   GET /api/v1/users/:id
// @access  Public
const getUser = (req, res) => {
  res.send("get user");
};

// @desc    Update User
// @route   PATCH /api/v1/users/:id
// @access  PRIVATE
const updateUser = (req, res) => {
  res.send("update user");
};

// @desc    Delete User
// @route   DELETE /api/v1/users/:id
// @access  PRIVATE
const deleteUser = (req, res) => {
  res.send("delete user");
};

module.exports = {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
};
