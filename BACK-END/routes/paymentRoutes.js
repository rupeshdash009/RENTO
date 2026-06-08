const express = require("express");

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create-order/:bookingId",
  protect,
  authorize("customer"),
  createPaymentOrder,
);

router.post("/verify", protect, authorize("customer"), verifyPayment);

module.exports = router;
