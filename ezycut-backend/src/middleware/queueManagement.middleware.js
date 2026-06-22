const Queue = require(
  "../models/queue.model"
);

const Salon = require(
  "../models/salon.model"
);

const queueManagement =
  async (
    req,
    res,
    next
  ) => {
    try {
      const queue =
        await Queue.findById(
          req.params.id
        );

      if (!queue) {
        return res.status(404).json({
          success: false,
          message:
            "Queue entry not found",
        });
      }

      if (
        req.user.role ===
        "admin"
      ) {
        req.queue = queue;
        return next();
      }

      const salon =
        await Salon.findById(
          queue.salon
        );

      if (!salon) {
        return res.status(404).json({
          success: false,
          message: "Salon not found",
        });
      }

      const isOwner =
        salon.owner.toString() ===
        req.user._id.toString();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message:
            "Not authorized"
        });
      }

      req.queue = queue;

      next();
    } catch (error) {
      next(error);
    }
  };

module.exports =
  queueManagement;