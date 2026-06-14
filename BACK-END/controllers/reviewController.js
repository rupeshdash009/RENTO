const Review = require("../models/Review");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");

const refreshVehicleRating = async (vehicleId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        vehicle: vehicleId,
      },
    },
    {
      $group: {
        _id: "$vehicle",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating || 0;
  const reviewCount = stats[0]?.reviewCount || 0;

  await Vehicle.findByIdAndUpdate(vehicleId, {
    averageRating: Number(averageRating.toFixed(1)),
    reviewCount,
  });
};

const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({
        message: "Booking id and rating are required",
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
        message: "You can review only your own booking",
      });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({
        message: "Review is allowed only after booking is completed",
      });
    }

    const existingReview = await Review.findOne({ booking: booking._id });

    if (existingReview) {
      return res.status(400).json({
        message: "Review already submitted for this booking",
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      owner: booking.owner,
      vehicle: booking.vehicle,
      booking: booking._id,
      rating: Number(rating),
      comment: comment || "",
    });

    await refreshVehicleRating(booking.vehicle);

    const populatedReview = await Review.findById(review._id)
      .populate("customer", "name email")
      .populate("vehicle", "vehicleName brand model images");

    return res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    return res.status(500).json({
      message: error.message || "Review creation failed",
    });
  }
};

const getVehicleReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("GET VEHICLE REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load reviews",
    });
  }
};

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate("vehicle", "vehicleName brand model images")
      .populate("booking")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      reviews,
    });
  } catch (error) {
    console.error("GET MY REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Failed to load your reviews",
    });
  }
};

module.exports = {
  createReview,
  getVehicleReviews,
  getMyReviews,
};
