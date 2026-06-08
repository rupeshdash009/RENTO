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

const { paymentWebhook } = require("./controllers/paymentController");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentWebhook,
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("RentiGo API is running");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
