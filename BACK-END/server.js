const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

let reviewRoutes = null;

try {
  reviewRoutes = require("./routes/reviewRoutes");
} catch {
  reviewRoutes = null;
}

const { paymentWebhook } = require("./controllers/paymentController");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://rento-smart.vercel.app",
  "https://rento-bay-ten.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(helmet());

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

// Razorpay webhook must stay before express.json()
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook,
);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Rento API is running");
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "API is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);

if (reviewRoutes) {
  app.use("/api/reviews", reviewRoutes);
}

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(error.status || 500).json({
    message: error.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
