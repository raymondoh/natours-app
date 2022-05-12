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
  deleteMe,
  getMe
} = require("../controllers/userController");
const { protectedRoute, restrictTo } = require("../controllers/authController");

// import middleware

// protect all routes below
router.use(protectedRoute);

// set up routes
router.route("/me").get(getMe, getUser);
router.route("/update-me").patch(updateMe);
router.route("/delete-me").delete(deleteMe);

// protect all routes below to admin
router.use(restrictTo);

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

// export router
module.exports = router;
