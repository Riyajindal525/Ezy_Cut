const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const { subscribeToOpenReminder } = require("../controllers/salonReminder.controller");

router.post("/:salonId/notify-me", protect, subscribeToOpenReminder);

module.exports = router;