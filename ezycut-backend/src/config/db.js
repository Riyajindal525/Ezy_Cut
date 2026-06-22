const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log("====================================");
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📦 Database Host : ${conn.connection.host}`);
    console.log(`🗄️ Database Name : ${conn.connection.name}`);
    console.log("====================================");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error("Error Message:", error.message);

    process.exit(1);
  }
};

module.exports = connectDB;