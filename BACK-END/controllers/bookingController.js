const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
};

const calculateTotalPrice = (vehicle, startDate, endDate, rentalPlan) => {
  const days = getDaysBetween(startDate, endDate);

  if (rentalPlan === "monthly") {
    return Math.ceil(days / 30) * vehicle.priceMonthly;
  }

  if (rentalPlan === "weekly") {
    return Math.ceil(days / 7) * vehicle.priceWeekly;
  }

  return days * vehicle.priceDaily;
};

const hasBookingConflict = async (vehicleId, startDate, endDate) => {
  const conflict = await Booking.findOne({
    vehicle: vehicleId,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  return Boolean(conflict);
};

const createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, rentalPlan } = req.body;

    if (!vehicleId || !startDate || !endDate) {
      return res.status(400).json({
        message: "Vehicle, start date and end date are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle id",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid booking dates",
      });
    }

    if (start >= end) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    if (vehicle.status !== "available") {
      return res.status(400).json({
        message: "Vehicle is not available",
      });
    }

    if (vehicle.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Vehicle is not approved yet",
      });
    }

    if (String(vehicle.owner) === String(req.user._id)) {
      return res.status(400).json({
        message: "Owner cannot book own vehicle",
      });
    }

    const conflict = await hasBookingConflict(vehicleId, start, end);

    if (conflict) {
      return res.status(409).json({
        message: "Vehicle is already booked for selected dates",
      });
    }

    const plan = rentalPlan || "daily";
    const totalPrice = calculateTotalPrice(vehicle, start, end, plan);

    const booking = await Booking.create({
      customer: req.user._id,
      owner: vehicle.owner,
      vehicle: vehicle._id,
      startDate: start,
      endDate: end,
      rentalPlan: plan,
      totalPrice,
      status: "pending",
      paymentStatus: "unpaid",
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("vehicle")
      .populate("customer", "name email phone")
      .populate("owner", "name email phone");

    return res.status(201).json({
      message: "Booking request created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      message: error.message || "Booking creation failed",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id })
      .populate("vehicle")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load bookings",
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const query = req.user.role === "admin" ? {} : { owner: req.user._id };

    const bookings = await Booking.find(query)
      .populate("vehicle")
      .populate("customer", "name email phone")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("GET OWNER BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load owner bookings",
    });
  }
};

const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicle");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      String(booking.owner) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Not authorized to approve this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be approved",
      });
    }

    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      vehicle: booking.vehicle._id,
      status: "approved",
      startDate: { $lte: booking.endDate },
      endDate: { $gte: booking.startDate },
    });

    if (conflict) {
      return res.status(409).json({
        message: "Another approved booking already exists for these dates",
      });
    }

    booking.status = "approved";
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("vehicle")
      .populate("customer", "name email phone")
      .populate("owner", "name email phone");

    return res.status(200).json({
      message: "Booking approved successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("APPROVE BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking approval failed",
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      String(booking.owner) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Not authorized to reject this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be rejected",
      });
    }

    booking.status = "rejected";
    booking.rejectionReason = rejectionReason || "Rejected by owner";
    await booking.save();

    return res.status(200).json({
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking rejection failed",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      String(booking.customer) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Not authorized to cancel this booking",
      });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({
        message: "This booking cannot be cancelled",
      });
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking cancellation failed",
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      req.user.role !== "admin" &&
      String(booking.owner) !== String(req.user._id)
    ) {
      return res.status(403).json({
        message: "Not authorized to complete this booking",
      });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        message: "Only approved bookings can be completed",
      });
    }

    if (booking.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Only paid bookings can be completed",
      });
    }

    booking.status = "completed";
    booking.completedAt = new Date();

    await booking.save();

    return res.status(200).json({
      message: "Booking marked as completed",
      booking,
    });
  } catch (error) {
    console.error("COMPLETE BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking completion failed",
    });
  }
};

const getVehicleUnavailableDates = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json({
        message: "Invalid vehicle id",
      });
    }

    const bookings = await Booking.find({
      vehicle: vehicleId,
      status: { $in: ["pending", "approved"] },
    }).select("startDate endDate status");

    return res.status(200).json({
      unavailableDates: bookings.map((booking) => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
      })),
    });
  } catch (error) {
    console.error("UNAVAILABLE DATES ERROR:", error);

    return res.status(500).json({
      message: "Failed to load unavailable dates",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
  getVehicleUnavailableDates,
};
