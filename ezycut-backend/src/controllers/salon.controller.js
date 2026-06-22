const asyncHandler = require(
  "../utils/asyncHandler"
);

const {
  createSalonService,
  getAllSalonsService,
  getSalonByIdService,
  getNearbySalonsService,
  updateSalonService,
  deleteSalonService,
  assignOwnerService,
} = require(
  "../services/salon.service"
);

const createSalon = asyncHandler(
  async (req, res) => {
    const salon =
      await createSalonService(
        req.body,
        req.user
      );

    res.status(201).json({
      success: true,
      message:
        "Salon created successfully",
      salon,
    });
  }
);

const getAllSalons = asyncHandler(
  async (req, res) => {
    const salons =
      await getAllSalonsService();

    res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  }
);

const getSalonById = asyncHandler(
  async (req, res) => {
    const salon =
      await getSalonByIdService(
        req.params.id
      );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found",
      });
    }

    res.status(200).json({
      success: true,
      salon,
    });
  }
);

const getNearbySalons =
  asyncHandler(async (req, res) => {
    const {
      longitude,
      latitude,
      radius,
    } = req.query;

    const salons =
      await getNearbySalonsService(
        longitude,
        latitude,
        radius
      );

    res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  });

const updateSalon = asyncHandler(
  async (req, res) => {
    const salon =
      await updateSalonService(
        req.salon,
        req.body
      );

    res.status(200).json({
      success: true,
      message:
        "Salon updated successfully",
      salon,
    });
  }
);

const deleteSalon = asyncHandler(
  async (req, res) => {
    await deleteSalonService(
      req.salon
    );

    res.status(200).json({
      success: true,
      message:
        "Salon deleted successfully",
    });
  }
);

const assignOwner = asyncHandler(
  async (req, res) => {
    const salon =
      await assignOwnerService(
        req.params.id,
        req.body.ownerId
      );

    res.status(200).json({
      success: true,
      message:
        "Owner assigned successfully",
      salon,
    });
  }
);

module.exports = {
  createSalon,
  getAllSalons,
  getSalonById,
  getNearbySalons,
  updateSalon,
  deleteSalon,
  assignOwner,
};