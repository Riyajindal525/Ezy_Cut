const express = require(
  "express"
);

const router =
  express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const authorizeRoles = require(
  "../middleware/role.middleware"
);

const serviceOwnership = require(
  "../middleware/serviceOwnership.middleware"
);

const {
  validateService,
} = require(
  "../validations/service.validation"
);

const {
  createService,
  getServicesBySalon,
  getServiceById,
  updateService,
  deleteService,
} = require(
  "../controllers/service.controller"
);

const createServiceAuthorization =
  require(
    "../middleware/createServiceAuthorization.middleware"
  );

// PUBLIC

router.get(
  "/salon/:salonId",
  getServicesBySalon
);

router.get(
  "/:id",
  getServiceById
);

// CREATE
router.post(
  "/",
  protect,
  authorizeRoles(
    "admin",
    "salon_owner"
  ),
  validateService,
  createServiceAuthorization,
  createService
);

// UPDATE

router.put(
  "/:id",
  protect,
  serviceOwnership,
  updateService
);

// DELETE

router.delete(
  "/:id",
  protect,
  serviceOwnership,
  deleteService
);

module.exports = router;