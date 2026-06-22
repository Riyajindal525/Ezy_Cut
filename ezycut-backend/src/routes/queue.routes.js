const express = require(
  "express"
);

const router =
  express.Router();

const protect = require(
  "../middleware/auth.middleware"
);

const authorizeRoles =
  require(
    "../middleware/role.middleware"
  );
const queueAccess =
  require(
    "../middleware/queueAccess.middleware"

  );

  const queueManagement =
  require(
    "../middleware/queueManagement.middleware"
  );
const {
  joinQueue,
  getMyQueueStatus,
  getSalonQueue,
   startService,
   completeQueue,
    cancelQueue,
    getQueueByToken, 
} = require(
  "../controllers/queue.controller"
);

router.post(
  "/join",
  protect,
  authorizeRoles(
    "customer",
    "admin"
  ),
  joinQueue
);

router.get(
  "/my-status",
  protect,
  authorizeRoles(
    "customer",
    "admin"
  ),
  getMyQueueStatus
);

router.get(
  "/salon/:salonId",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  queueAccess,
  getSalonQueue
);

router.get(
  "/token/:tokenCode",
  getQueueByToken
);

router.patch(
  "/:id/start",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  queueManagement,
  startService
);

router.patch(
  "/:id/complete",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  queueManagement,
  completeQueue
);

router.patch(
  "/:id/cancel",
  protect,
  authorizeRoles(
    "salon_owner",
    "admin"
  ),
  queueManagement,
  cancelQueue
);

module.exports = router;