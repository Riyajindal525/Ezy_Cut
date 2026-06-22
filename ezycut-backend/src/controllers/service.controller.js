const asyncHandler = require(
  "../utils/asyncHandler"
);

const {
  createServiceService,
  getServicesBySalonService,
  getServiceByIdService,
  updateServiceService,
  deleteServiceService,
} = require(
  "../services/service.service"
);

const createService =
  asyncHandler(async (req, res) => {
    const service =
      await createServiceService(
        req.body,
        req.salon
      );

    res.status(201).json({
      success: true,
      message:
        "Service created successfully",
      service,
    });
  });

const getServicesBySalon =
  asyncHandler(async (req, res) => {
    const services =
      await getServicesBySalonService(
        req.params.salonId
      );

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  });

const getServiceById =
  asyncHandler(async (req, res) => {
    const service =
      await getServiceByIdService(
        req.params.id
      );

    if (!service) {
      return res.status(404).json({
        success: false,
        message:
          "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  });

const updateService =
  asyncHandler(async (req, res) => {
    const service =
      await updateServiceService(
        req.service,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Service updated successfully",
      service,
    });
  });

const deleteService =
  asyncHandler(async (req, res) => {
    await deleteServiceService(
      req.service
    );

    res.status(200).json({
      success: true,
      message:
        "Service deleted successfully",
    });
  });

module.exports = {
  createService,
  getServicesBySalon,
  getServiceById,
  updateService,
  deleteService,
};