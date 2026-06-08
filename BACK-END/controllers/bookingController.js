const Booking = require("../models/booking");
const Vehicle = require("../models/Vehicle");
const MaintenanceBlock = require("../models/MaintenanceBlock");

const calculateTotalAmount = (vehicle, rentalPlan, startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = end.getTime() - start.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 1) {
    throw new Error("End date must be after start date");
  }

  if (rentalPlan === "daily") {
    return days * vehicle.priceDaily;
  }

  if (rentalPlan === "weekly") {
    return Math.ceil(days / 7) * vehicle.priceWeekly;
  }

  if (rentalPlan === "monthly") {
    return Math.ceil(days / 30) * vehicle.priceMonthly;
  }

  throw new Error("Invalid rental plan");
};

const checkBookingConflict = async (vehicleId, startDate, endDate) => {
  return await Booking.findOne({
    vehicle: vehicleId,
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
  });
};

const checkMaintenanceConflict = async (vehicleId, startDate, endDate) => {
  return await MaintenanceBlock.findOne({
    vehicle: vehicleId,
    status: "active",
    startDate: { $lte: new Date(endDate) },
    endDate: { $gte: new Date(startDate) },
  });
};

const createBooking = async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, rentalPlan } = req.body;

    if (!vehicleId || !startDate || !endDate || !rentalPlan) {
      return res.status(400).json({
        message: "Vehicle, start date, end date and rental plan are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid start date or end date",
      });
    }

    if (end <= start) {
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

    if (vehicle.approvalStatus !== "approved") {
      return res.status(400).json({
        message: "Vehicle is not approved by admin yet",
      });
    }

    if (vehicle.status !== "available") {
      return res.status(400).json({
        message: "Vehicle is not available right now",
      });
    }

    const bookingConflict = await checkBookingConflict(
      vehicleId,
      startDate,
      endDate,
    );

    if (bookingConflict) {
      return res.status(409).json({
        message: "Vehicle already booked or requested for selected dates",
      });
    }

    const maintenanceConflict = await checkMaintenanceConflict(
      vehicleId,
      startDate,
      endDate,
    );

    if (maintenanceConflict) {
      return res.status(409).json({
        message: "Vehicle is blocked for maintenance during selected dates",
      });
    }

    const totalAmount = calculateTotalAmount(
      vehicle,
      rentalPlan,
      startDate,
      endDate,
    );

    const booking = await Booking.create({
      user: req.user._id,
      owner: vehicle.owner,
      vehicle: vehicle._id,
      startDate,
      endDate,
      rentalPlan,
      totalAmount,
      status: "pending",
    });

    return res.status(201).json({
      message: "Booking request sent successfully",
      booking,
    });
  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking creation failed",
      error: error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user._id,
    })
      .populate("vehicle")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET MY BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      owner: req.user._id,
    })
      .populate("vehicle")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (error) {
    console.error("GET OWNER BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch owner bookings",
      error: error.message,
    });
  }
};

const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not allowed to approve this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be approved",
      });
    }

    const existingApprovedBooking = await Booking.findOne({
      _id: { $ne: booking._id },
      vehicle: booking.vehicle,
      status: "approved",
      startDate: { $lte: booking.endDate },
      endDate: { $gte: booking.startDate },
    });

    if (existingApprovedBooking) {
      return res.status(409).json({
        message: "Another booking is already approved for these dates",
      });
    }

    const maintenanceConflict = await checkMaintenanceConflict(
      booking.vehicle,
      booking.startDate,
      booking.endDate,
    );

    if (maintenanceConflict) {
      return res.status(409).json({
        message: "Vehicle is blocked for maintenance during selected dates",
      });
    }

    booking.status = "approved";
    await booking.save();

    return res.status(200).json({
      message: "Booking approved successfully",
      booking,
    });
  } catch (error) {
    console.error("APPROVE BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking approval failed",
      error: error.message,
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (
      booking.owner.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not allowed to reject this booking",
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Only pending bookings can be rejected",
      });
    }

    booking.status = "rejected";
    await booking.save();

    return res.status(200).json({
      message: "Booking rejected successfully",
      booking,
    });
  } catch (error) {
    console.error("REJECT BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking rejection failed",
      error: error.message,
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
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not allowed to cancel this booking",
      });
    }

    if (!["pending", "rejected"].includes(booking.status)) {
      return res.status(400).json({
        message: "Only pending or rejected bookings can be cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error("CANCEL BOOKING ERROR:", error);

    return res.status(500).json({
      message: "Booking cancellation failed",
      error: error.message,
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
};
