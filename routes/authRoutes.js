// import packages - express/router()
const express = require("express");
const router = express.Router();

// import controllers
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protectedRoute
} = require("../controllers/authController");

// import middleware

// set up routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").patch(resetPassword);
router.route("/update-password").patch(protectedRoute, updatePassword);

// export router
module.exports = router;
