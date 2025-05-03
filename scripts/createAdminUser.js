const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/yourdbname";

async function createAdminUser() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB.");

    const existingAdmin = await userModel.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
      console.log("Admin user already exists.");
      process.exit(0);
    }

    const hashedPassword = bcrypt.hashSync("Admin@123", 10);

    const adminUser = new userModel({
      name: "admin",
      email: "admin@example.com",
      password: hashedPassword,
      userRole: 1,
      verified: true,
    });

    await adminUser.save();
    console.log("Admin user created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    console.error("Make sure your MongoDB connection string (MONGO_URI) is set correctly.");
    process.exit(1);
  }
}

createAdminUser();
