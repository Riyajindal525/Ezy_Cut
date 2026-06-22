require("dotenv").config();

const http = require("http");

const app = require("./app");

const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Global Error Handlers
process.on("uncaughtException", (error) => {
  console.error("❌ UNCAUGHT EXCEPTION!");
  console.error("Error Message:", error.message);
  console.error("Stack:", error.stack);

  console.log("🛑 Server shutting down due to uncaught exception...");

  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("❌ UNHANDLED PROMISE REJECTION!");
  console.error("Error Message:", error.message);

  console.log("🛑 Server shutting down due to unhandled rejection...");

  server.close(() => {
    process.exit(1);
  });
});

// Start Server Function
const startServer = async () => {
  try {
    console.log("🚀 Starting EzyCut Backend Server...");

    // Connect MongoDB
    await connectDB();

    console.log("✅ MongoDB connection successful");

    // Start Server
    server.listen(PORT, () => {
      console.log("====================================");
      console.log("✅ EzyCut Backend Server Running");
      console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
      console.log(`🚀 Server URL  : http://localhost:${PORT}`);
      console.log(`📦 Port        : ${PORT}`);
      console.log("====================================");
    });
  } catch (error) {
    console.error("❌ SERVER START FAILED");
    console.error("Error Message:", error.message);

    process.exit(1);
  }
};

// Run Server
startServer();