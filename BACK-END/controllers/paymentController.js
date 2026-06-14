const crypto = require("crypto");
const Razorpay = require("razorpay");

const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
};

const calculateBookingAmount = (booking) => {
  if (Number(booking.totalPrice) > 0) {
    return Number(booking.totalPrice);
  }

  const vehicle = booking.vehicle;

  if (!vehicle) {
    return 0;
  }

  const days = getDaysBetween(booking.startDate, booking.endDate);
  const plan = booking.rentalPlan || "daily";

  if (plan === "monthly") {
    return Math.ceil(days / 30) * Number(vehicle.priceMonthly || 0);
  }

  if (plan === "weekly") {
    return Math.ceil(days / 7) * Number(vehicle.priceWeekly || 0);
  }

  return days * Number(vehicle.priceDaily || 0);
};

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in server environment");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
      .populate("vehicle")
      .populate("customer", "name email phone")
      .populate("owner", "name email phone");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      String(booking.customer?._id || booking.customer) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "You can pay only for your own booking",
      });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Payment is allowed only after booking approval",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "This booking is already paid",
      });
    }

    const finalAmount = calculateBookingAmount(booking);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        message:
          "Booking amount is ₹0. Please update vehicle price or recreate booking.",
      });
    }

    if (Number(booking.totalPrice) <= 0) {
      booking.totalPrice = finalAmount;
      await booking.save();
    }

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: String(booking._id),
        customerId: String(req.user._id),
        vehicleId: String(booking.vehicle?._id || booking.vehicle),
      },
    });

    await Payment.create({
      booking: booking._id,
      customer: booking.customer?._id || booking.customer,
      owner: booking.owner?._id || booking.owner,
      vehicle: booking.vehicle?._id || booking.vehicle,
      razorpayOrderId: order.id,
      amount: finalAmount,
      currency: "INR",
      status: "created",
      rawResponse: order,
    });

    return res.status(200).json({
      message: "Payment order created successfully",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      bookingAmount: finalAmount,
    });
  } catch (error) {
    console.error("CREATE PAYMENT ORDER ERROR:", error);

    return res.status(500).json({
      message: error.message || "Payment order creation failed",
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !bookingId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Payment verification data is missing",
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        message: "Razorpay secret is missing in server environment",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          status: "failed",
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      );

      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (String(booking.customer) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can verify only your own payment",
      });
    }

    booking.paymentStatus = "paid";
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        rawResponse: req.body,
      },
      { new: true },
    );

    return res.status(200).json({
      message: "Payment successful",
      booking,
      payment,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      message: error.message || "Payment verification failed",
    });
  }
};

const paymentWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        message: "Webhook secret missing",
      });
    }

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event === "payment.captured") {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        {
          status: "paid",
          razorpayPaymentId,
          rawResponse: event,
        },
        { new: true },
      );

      if (payment) {
        await Booking.findByIdAndUpdate(payment.booking, {
          paymentStatus: "paid",
          paymentId: razorpayPaymentId,
        });
      }
    }

    if (event.event === "payment.failed") {
      const paymentEntity = event.payload.payment.entity;

      await Payment.findOneAndUpdate(
        { razorpayOrderId: paymentEntity.order_id },
        {
          status: "failed",
          rawResponse: event,
        },
      );
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("PAYMENT WEBHOOK ERROR:", error);

    return res.status(500).json({
      message: "Webhook handling failed",
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  paymentWebhook,
};
