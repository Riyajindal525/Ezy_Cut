const Service = require(
  "../models/service.model"
);

const serviceOwnership = async (
  req,
  res,
  next
) => {
  try {
    const service =
      await Service.findById(
        req.params.id
      ).populate("salon");

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found",
      });
    }

    if (
      req.user.role === "admin"
    ) {
      req.service = service;
      return next();
    }

    const isOwner =
      service.salon.owner.toString() ===
      req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to manage this service",
      });
    }

    req.service = service;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports =
  serviceOwnership;