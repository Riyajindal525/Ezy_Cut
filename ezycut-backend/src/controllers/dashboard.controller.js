const asyncHandler =
  require(
    "../utils/asyncHandler"
  );

const {
  getOwnerOverviewService,
  getRecentBookingsService,
  getTopServicesService,
  getMonthlyRevenueService,
    getAdminOverviewService,
    getRecentSalonsService,
    getRecentUsersService,
    getTopSalonsService,
    getPlatformRevenueService
} = require(
  "../services/dashboard.service"
);

const getOwnerOverview =
  asyncHandler(async (
    req,
    res
  ) => {
    const overview =
      await getOwnerOverviewService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      overview,
    });
  });

  const getRecentBookings =
  asyncHandler(async (
    req,
    res
  ) => {
    const bookings =
      await getRecentBookingsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count:
        bookings.length,
      bookings,
    });
  });

  const getTopServices =
  asyncHandler(async (
    req,
    res
  ) => {
    const services =
      await getTopServicesService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count:
        services.length,
      services,
    });
  });

  const getMonthlyRevenue =
  asyncHandler(async (
    req,
    res
  ) => {
    const revenue =
      await getMonthlyRevenueService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      revenue,
    });
  });

  const getAdminOverview =
  asyncHandler(async (
    req,
    res
  ) => {
    const overview =
      await getAdminOverviewService();

    res.status(200).json({
      success: true,
      overview,
    });
  });
  const getRecentSalons =
  asyncHandler(async (
    req,
    res
  ) => {
    const salons =
      await getRecentSalonsService();

    res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  });
  
  const getRecentUsers =
  asyncHandler(async (
    req,
    res
  ) => {
    const users =
      await getRecentUsersService();

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  });

  const getTopSalons =
  asyncHandler(async (
    req,
    res
  ) => {
    const salons =
      await getTopSalonsService();

    res.status(200).json({
      success: true,
      count: salons.length,
      salons,
    });
  });

  const getPlatformRevenue =
  asyncHandler(async (
    req,
    res
  ) => {
    const revenue =
      await getPlatformRevenueService();

    res.status(200).json({
      success: true,
      revenue,
    });
  });
  
module.exports = {
  getOwnerOverview,
  getRecentBookings,
  getTopServices,
  getMonthlyRevenue,
 getAdminOverview,
    getRecentSalons,
    getRecentUsers,
    getTopSalons,
    getPlatformRevenue
};
