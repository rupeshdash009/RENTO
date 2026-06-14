const express = require("express");

const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  getVehicleUnavailableDates,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/vehicle/:vehicleId/unavailable-dates", getVehicleUnavailableDates);

router.post("/", protect, authorize("customer"), createBooking);

router.get("/my-bookings", protect, authorize("customer"), getMyBookings);

router.get(
  "/owner/bookings",
  protect,
  authorize("owner", "admin"),
  getOwnerBookings,
);

router.put(
  "/:id/approve",
  protect,
  authorize("owner", "admin"),
  approveBooking,
);

router.put("/:id/reject", protect, authorize("owner", "admin"), rejectBooking);

router.put(
  "/:id/complete",
  protect,
  authorize("owner", "admin"),
  completeBooking,
);

router.put(
  "/:id/cancel",
  protect,
  authorize("customer", "admin"),
  cancelBooking,
);

module.exports = router;
