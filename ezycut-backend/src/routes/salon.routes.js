const express = require("express");

const router = express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const authorizeRoles = require(
  "../middleware/role.middleware"
);

const checkSalonOwnership = require(
  "../middleware/salonOwnership.middleware"
);

const {
  validateSalon,
} = require(
  "../validations/salon.validation"
);

const {
  createSalon,
  getAllSalons,
  getSalonById,
  getNearbySalons,
  updateSalon,
  deleteSalon,
  assignOwner,
} = require(
  "../controllers/salon.controller"
);

// PUBLIC

router.get("/", getAllSalons);

router.get(
  "/nearby",
  getNearbySalons
);

router.get("/:id", getSalonById);

// CREATE SALON

router.post(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "salon_owner"
  ),
  validateSalon,
  createSalon
);

// UPDATE SALON

router.put(
  "/:id",
  protect,
  checkSalonOwnership,
  updateSalon
);

// DELETE SALON

router.delete(
  "/:id",
  protect,
  checkSalonOwnership,
  deleteSalon
);

// ASSIGN OWNER

router.patch(
  "/:id/assign-owner",
  protect,
  authorizeRoles("admin"),
  assignOwner
);

module.exports = router;