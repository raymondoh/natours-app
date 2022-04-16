// import packages - express/router()
const express = require("express");
const router = express.Router();

// import controllers
const { getAllUsers, createUser, getUser, updateUser, deleteUser } = require("../controllers/userController");

// import middleware

// set up routes
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

// export router
module.exports = router;
