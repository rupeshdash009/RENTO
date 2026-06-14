const express = require("express");

const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-order/:bookingId",
  protect,
  authorize("customer"),
  createOrder,
);

router.post("/verify", protect, authorize("customer"), verifyPayment);

module.exports = router;
