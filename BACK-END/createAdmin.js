const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/user");
const dns = require("dns");
dotenv.config();
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected DB:", mongoose.connection.name);

    const email = "admin@rentigo.com";
    const password = "admin123";

    await User.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      name: "RentiGo Admin",
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin reset successfully");
    console.log("ID:", admin._id.toString());
    console.log("Email:", email);
    console.log("Password:", password);

    process.exit(0);
  } catch (error) {
    console.error("Admin reset failed:", error);
    process.exit(1);
  }
};

createAdmin();
