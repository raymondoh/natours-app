// import packages - express/router()
const express = require("express");
const router = express.Router();
const reviewRouter = require("./reviewRoutes");
// import controllers
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan
} = require("../controllers/tourController");

// import middleware
const { protectedRoute, restrictTo } = require("../controllers/authController");

// Merge Params
router.use("/:tourId/reviews", reviewRouter);

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(protectedRoute, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);
router.route("/").get(getAllTours).post(protectedRoute, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protectedRoute, restrictTo("admin", "lead-guide"), updateTour)
  .delete(protectedRoute, restrictTo("admin", "lead-guide"), deleteTour);

module.exports = router;
