// import packages - express/router()
const express = require("express");
const router = express.Router({ mergeParams: true });

// import controllers
const {
  getReview,
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds
} = require("../controllers/ReviewController");

// import middleware
const { protectedRoute, restrictTo } = require("../controllers/authController");

// protect all review routes
router.use(protectedRoute);

// set up routes
router.route("/").get(getAllReviews).post(restrictTo("user"), setTourUserIds, createReview);
router
  .route("/:id")
  .get(getReview)
  .delete(restrictTo("admin", "user"), deleteReview)
  .patch(restrictTo("admin", "user"), updateReview);

// export router
module.exports = router;
