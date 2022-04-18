// import packages - express/router()
const express = require("express");
const router = express.Router();

// import controllers
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe
} = require("../controllers/userController");
const { protectedRoute } = require("../controllers/authController");

// import middleware

// set up routes
router.route("/update-me").patch(protectedRoute, updateMe);
router.route("/delete-me").delete(protectedRoute, deleteMe);
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

// export router
module.exports = router;
