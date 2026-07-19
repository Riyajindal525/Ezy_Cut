const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const salonRoutes = require("./routes/salon.routes");
const serviceRoutes = require("./routes/service.routes");
const bookingRoutes = require("./routes/booking.routes");
const queueRoutes = require("./routes/queue.routes");
const reviewRoutes = require("./routes/review.routes");
const notificationRoutes = require("./routes/notification.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const paymentRoutes = require("./routes/payment.routes");
const kycRoutes = require("./routes/kyc.routes");


const errorMiddleware = require("./middleware/error.middleware");
const notFound = require("./middleware/notFound.middleware");

const app = express();


// ==============================
// MIDDLEWARE
// ==============================

// Parse JSON bodies — skip multipart/form-data so multer can handle those
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) return next();
  express.json()(req, res, next);
});

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// 
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5173",
      "https://ezy-cut.vercel.app"
      ,

      // New Custom Domains
      "https://ezycut.co.in",
      "https://www.ezycut.co.in",
    ],
    credentials: true,
  })
);
app.use(helmet());

app.use(morgan("dev"));

app.use(cookieParser());

// Serve local uploads statically
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==============================
// RATE LIMITERS
// ==============================

// Auth: 15 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Payments: 30 requests per 15 minutes per IP
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: "Too many payment requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// ==============================
// HEALTH CHECK ROUTE
// ==============================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EzyCut API Running Successfully",
  });
});


// ==============================
// API ROUTES
// ==============================

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/test", testRoutes);
app.use("/api/salons", salonRoutes);
app.use(
  "/api/services",
  serviceRoutes
);
app.use(
  "/api/bookings",
  bookingRoutes
);
app.use(
  "/api/queue",
  queueRoutes
);
app.use(
  "/api/reviews",
  reviewRoutes
);
app.use(
  "/api/notifications",
  notificationRoutes
);
app.use(
  "/api/dashboard",
  dashboardRoutes
);
app.use("/api/payments", paymentLimiter, paymentRoutes);
app.use("/api/kyc", kycRoutes);
// ==============================
// 404 ROUTE HANDLER
// ==============================

app.use(notFound);


// ==============================
// GLOBAL ERROR HANDLER
// ==============================

app.use(errorMiddleware);

module.exports = app;
