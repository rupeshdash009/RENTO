const express = require("express");

const {
  createReview,
  getVehicleReviews,
  getMyReviews,
} = require("../controllers/reviewController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/vehicle/:vehicleId", getVehicleReviews);
router.get("/my-reviews", protect, authorize("customer"), getMyReviews);
router.post("/", protect, authorize("customer"), createReview);

module.exports = router;
