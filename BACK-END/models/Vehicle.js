const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    variant: {
      type: String,
      default: "",
      trim: true,
    },

    modelYear: {
      type: Number,
      required: true,
      min: 2022,
      max: 2026,
    },

    type: {
      type: String,
      enum: ["two-wheeler", "four-wheeler"],
      required: true,
    },

    bodyType: {
      type: String,
      enum: [
        "scooter",
        "motorcycle",
        "electric-scooter",
        "hatchback",
        "sedan",
        "suv",
        "mpv",
        "electric-car",
        "luxury",
      ],
      default: "motorcycle",
    },

    fuelType: {
      type: String,
      enum: ["petrol", "diesel", "electric", "cng", "hybrid"],
      required: true,
    },

    transmission: {
      type: String,
      enum: ["manual", "automatic"],
      default: "manual",
    },

    priceDaily: {
      type: Number,
      required: true,
    },

    priceWeekly: {
      type: Number,
      required: true,
    },

    priceMonthly: {
      type: Number,
      required: true,
    },

    depositAmount: {
      type: Number,
      default: 0,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    specs: {
      engineCC: { type: Number, default: null },
      batteryRangeKm: { type: Number, default: null },
      mileageKmpl: { type: Number, default: null },
      seatingCapacity: { type: Number, default: null },
      color: { type: String, default: "" },
      power: { type: String, default: "" },
      torque: { type: String, default: "" },
      topSpeed: { type: String, default: "" },
      bootSpace: { type: String, default: "" },
      groundClearance: { type: String, default: "" },
      airbags: { type: Number, default: null },
      abs: { type: Boolean, default: false },
      features: {
        type: [String],
        default: [],
      },
    },

    status: {
      type: String,
      enum: ["available", "maintenance", "inactive"],
      default: "available",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);
