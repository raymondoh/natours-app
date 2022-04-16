// import packages - express/router()
const express = require("express");
const router = express.Router();

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

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route("/monthly-plan/:year").get(getMonthlyPlan);
router.route("/").get(protectedRoute, getAllTours).post(createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(protectedRoute, restrictTo("admin", "lead-guide"), deleteTour);

// export router
module.exports = router;
