// import packages - express/router()
const express = require("express");
const router = express.Router();

// import controllers
const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");

// import middleware

// set up routes
router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

// export router
module.exports = router;
