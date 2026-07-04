const fs = require("fs");
const path = require("path");

const errorMiddleware = (err, req, res, next) => {
  console.log(err);

  try {
    const scratchDir = path.join(__dirname, "../../scratch");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    const logPath = path.join(scratchDir, "server_errors.log");
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}\n` +
      `User: ${req.user ? req.user._id + " (" + req.user.role + ")" : "Guest"}\n` +
      `Error: ${err.message}\n` +
      `Stack: ${err.stack}\n` +
      `Headers: ${JSON.stringify(req.headers, null, 2)}\n` +
      `--------------------------------------------------\n`;
    fs.appendFileSync(logPath, logEntry);
  } catch (logErr) {
    console.error("Failed to write to error log file:", logErr);
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorMiddleware;