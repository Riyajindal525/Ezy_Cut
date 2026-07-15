const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");
const salonBookingAccess = require("../middleware/salonBookingAccess.middleware");
const bookingOwnership = require("../middleware/bookingOwnership.middleware");
const bookingManagement = require("../middleware/bookingManagement.middleware");
const { validateBooking } = require("../validations/booking.validation");

const {
  getAvailableSlots,
  createBooking,
  getMyBookings,
  cancelBooking,
  getSalonBookings,
  completeBooking,
  markNoShow,
  ownerCancelBooking,
  acceptBooking,
} = require("../controllers/booking.controller");

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// GET /api/bookings/available-slots
router.get("/available-slots", getAvailableSlots);

/*
|--------------------------------------------------------------------------
| Customer Routes
|--------------------------------------------------------------------------
*/

// POST /api/bookings
router.post(
  "/",
  protect,
  authorizeRoles("customer", "admin"),
  validateBooking,
  createBooking
);

// GET /api/bookings/my-bookings
router.get(
  "/my-bookings",
  protect,
  authorizeRoles("customer", "admin"),
  getMyBookings
);

// PATCH /api/bookings/:id/cancel
router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles("customer", "admin"),
  bookingOwnership,
  cancelBooking
);

/*
|--------------------------------------------------------------------------
| Salon Owner Routes
|--------------------------------------------------------------------------
*/

// GET /api/bookings/salon/:salonId
router.get(
  "/salon/:salonId",
  protect,
  authorizeRoles("salon_owner", "admin"),
  salonBookingAccess,
  getSalonBookings
);

// PATCH /api/bookings/:id/accept  ← Owner accepts a pending booking
router.patch(
  "/:id/accept",
  protect,
  authorizeRoles("salon_owner", "admin"),
  bookingManagement,
  acceptBooking
);

// PATCH /api/bookings/:id/complete
router.patch(
  "/:id/complete",
  protect,
  authorizeRoles("salon_owner", "admin"),
  bookingManagement,
  completeBooking
);

// PATCH /api/bookings/:id/no-show
router.patch(
  "/:id/no-show",
  protect,
  authorizeRoles("salon_owner", "admin"),
  bookingManagement,
  markNoShow
);

// PATCH /api/bookings/:id/owner-cancel
router.patch(
  "/:id/owner-cancel",
  protect,
  authorizeRoles("salon_owner", "admin"),
  bookingManagement,
  ownerCancelBooking
);

module.exports = router;