const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Connected Successfully");
    console.log(`Host: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error(error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.error(
        "Your local network/DNS is blocking MongoDB Atlas. Try mobile hotspot or DNS 8.8.8.8.",
      );
    }

    if (error.message.includes("bad auth")) {
      console.error("MongoDB username or password is wrong.");
    }

    if (error.message.includes("querySrv")) {
      console.error("MongoDB SRV DNS lookup failed. Check DNS/VPN/network.");
    }

    process.exit(1);
  }
};

module.exports = connectDB;
