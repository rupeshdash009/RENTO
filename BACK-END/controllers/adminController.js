const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Review = require("../models/Review");

const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalOwners,
      totalVehicles,
      pendingVehicles,
      approvedVehicles,
      totalBookings,
      paidBookings,
      completedBookings,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "owner" }),
      Vehicle.countDocuments(),
      Vehicle.countDocuments({ approvalStatus: "pending" }),
      Vehicle.countDocuments({ approvalStatus: "approved" }),
      Booking.countDocuments(),
      Booking.countDocuments({ paymentStatus: "paid" }),
      Booking.countDocuments({ status: "completed" }),
      Review.countDocuments(),
    ]);

    const revenueAgg = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
        },
      },
    ]);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalCustomers,
        totalOwners,
        totalVehicles,
        pendingVehicles,
        approvedVehicles,
        totalBookings,
        paidBookings,
        completedBookings,
        totalReviews,
        totalRevenue: revenueAgg[0]?.totalRevenue || 0,
      },
      monthlyRevenue,
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load users",
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({
        message: "Admin cannot deactivate own account",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      message: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user,
    });
  } catch (error) {
    console.error("TOGGLE USER ERROR:", error);

    return res.status(500).json({
      message: "Failed to update user status",
    });
  }
};

const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      vehicles,
    });
  } catch (error) {
    console.error("ADMIN VEHICLES ERROR:", error);

    return res.status(500).json({
      message: "Failed to load vehicles",
    });
  }
};

const approveVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    vehicle.approvalStatus = "approved";
    vehicle.rejectionReason = "";
    vehicle.status = "available";

    await vehicle.save();

    return res.status(200).json({
      message: "Vehicle approved successfully",
      vehicle,
    });
  } catch (error) {
    console.error("APPROVE VEHICLE ERROR:", error);

    return res.status(500).json({
      message: "Vehicle approval failed",
    });
  }
};

const rejectVehicle = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Vehicle not found",
      });
    }

    vehicle.approvalStatus = "rejected";
    vehicle.rejectionReason = rejectionReason || "Rejected by admin";

    await vehicle.save();

    return res.status(200).json({
      message: "Vehicle rejected successfully",
      vehicle,
    });
  } catch (error) {
    console.error("REJECT VEHICLE ERROR:", error);

    return res.status(500).json({
      message: "Vehicle rejection failed",
    });
  }
};

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("vehicle")
      .populate("customer", "name email phone")
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bookings,
    });
  } catch (error) {
    console.error("ADMIN BOOKINGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load bookings",
    });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  toggleUserStatus,
  getAllVehicles,
  approveVehicle,
  rejectVehicle,
  getAllBookings,
};
