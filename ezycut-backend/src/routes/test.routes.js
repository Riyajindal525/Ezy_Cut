const express = require("express");

const router = express.Router();

const protect = require("../middleware/auth.middleware");

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Test route working",
  });
});

router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;