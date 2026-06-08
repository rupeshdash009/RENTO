const crypto = require("crypto");
const Razorpay = require("razorpay");

const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are missing in .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const safeCompare = (received, generated) => {
  const receivedBuffer = Buffer.from(received || "");
  const generatedBuffer = Buffer.from(generated || "");

  if (receivedBuffer.length !== generatedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(receivedBuffer, generatedBuffer);
};

const createPaymentOrder = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to pay for this booking",
      });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Payment is allowed only after owner approves booking",
      });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Payment already completed for this booking",
      });
    }

    const amountInPaise = Math.round(Number(booking.totalAmount) * 100);

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({
        message: "Invalid booking amount",
      });
    }

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `booking_${booking._id}`,
      notes: {
        bookingId: booking._id.toString(),
        userId: booking.user.toString(),
        vehicleId: booking.vehicle._id.toString(),
      },
    });

    const payment = await Payment.findOneAndUpdate(
      {
        booking: booking._id,
      },
      {
        booking: booking._id,
        user: booking.user,
        owner: booking.owner,
        vehicle: booking.vehicle._id,
        razorpayOrderId: order.id,
        amount: booking.totalAmount,
        currency: "INR",
        status: "created",
        rawResponse: order,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      },
    );

    booking.payment = payment._id;
    booking.paymentStatus = "unpaid";
    await booking.save();

    return res.status(200).json({
      message: "Payment order created successfully",
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      booking: {
        id: booking._id,
        totalAmount: booking.totalAmount,
        vehicleName: booking.vehicle.vehicleName,
      },
    });
  } catch (error) {
    console.error("CREATE PAYMENT ORDER ERROR:", error);

    return res.status(500).json({
      message: "Payment order creation failed",
      error: error.message,
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

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to verify this payment",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValidSignature = safeCompare(
      razorpay_signature,
      generatedSignature,
    );

    if (!isValidSignature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const payment = await Payment.findOne({
      booking: booking._id,
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment record not found",
      });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";
    payment.rawResponse = req.body;
    await payment.save();

    booking.paymentStatus = "paid";
    booking.payment = payment._id;
    booking.paidAt = new Date();
    await booking.save();

    return res.status(200).json({
      message: "Payment verified successfully",
      payment,
      booking,
    });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);

    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

const paymentWebhook = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      return res.status(500).json({
        message: "Webhook secret missing",
      });
    }

    const receivedSignature = req.headers["x-razorpay-signature"];

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body)
      .digest("hex");

    const isValidSignature = safeCompare(receivedSignature, generatedSignature);

    if (!isValidSignature) {
      return res.status(400).json({
        message: "Invalid webhook signature",
      });
    }

    const event = JSON.parse(req.body.toString());

    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (!razorpayOrderId) {
      return res.status(200).json({
        message: "Webhook received but order ID not found",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId,
    });

    if (!payment) {
      return res.status(200).json({
        message: "Payment record not found for webhook",
      });
    }

    const booking = await Booking.findById(payment.booking);

    if (!booking) {
      return res.status(200).json({
        message: "Booking not found for webhook",
      });
    }

    if (event.event === "payment.captured" || event.event === "order.paid") {
      payment.status = "paid";
      payment.razorpayPaymentId =
        paymentEntity?.id || payment.razorpayPaymentId;
      payment.rawResponse = event;
      await payment.save();

      booking.paymentStatus = "paid";
      booking.payment = payment._id;
      booking.paidAt = booking.paidAt || new Date();
      await booking.save();
    }

    if (event.event === "payment.failed") {
      payment.status = "failed";
      payment.rawResponse = event;
      await payment.save();

      booking.paymentStatus = "failed";
      await booking.save();
    }

    return res.status(200).json({
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("PAYMENT WEBHOOK ERROR:", error);

    return res.status(500).json({
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  paymentWebhook,
};
