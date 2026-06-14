const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    rentalPlan: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "daily",
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled", "completed"],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed", "refunded"],
      default: "unpaid",
    },

    paymentId: {
      type: String,
      default: "",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ vehicle: 1, startDate: 1, endDate: 1 });
bookingSchema.index({ customer: 1 });
bookingSchema.index({ owner: 1 });

module.exports =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
