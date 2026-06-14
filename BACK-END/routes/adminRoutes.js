const express = require("express");

const {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAllVehicles,
  approveVehicle,
  rejectVehicle,
  getAllBookings,
} = require("../controllers/adminController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getAdminStats);

router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);

router.get("/vehicles", getAllVehicles);
router.put("/vehicles/:id/approve", approveVehicle);
router.put("/vehicles/:id/reject", rejectVehicle);

router.get("/bookings", getAllBookings);

module.exports = router;
