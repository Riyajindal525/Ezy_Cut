const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
];

const validateEnv = () => {
  const missing = [];

  requiredEnvVars.forEach((key) => {
    if (!process.env[key] || process.env[key].trim() === "") {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    console.error("================================================================");
    console.error("❌ STARTUP ERROR: Missing Critical Environment Variables!");
    console.error("================================================================");
    console.error("The following environment variables are required but not defined:");
    missing.forEach((v) => console.error(`  - \x1b[31m${v}\x1b[0m`));
    console.error("\nPlease copy .env.example to .env and configure these parameters.");
    console.error("================================================================");
    process.exit(1);
  }
};

validateEnv();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
};
