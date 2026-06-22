require("dotenv").config();

const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");

const User = require("../models/user.model");

const connectDB = require("../config/db");

connectDB();

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      email: "admin@ezycut.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash(
      "admin123",
      10
    );

    await User.create({
      name: "Super Admin",
      email: "admin@ezycut.com",
      phone: "9999999999",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created");

    process.exit();
  } catch (error) {
    console.log(error);

    process.exit(1);
  }
};

seedAdmin();