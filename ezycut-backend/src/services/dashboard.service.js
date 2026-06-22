const Booking = require(
  "../models/booking.model"
);

const Queue = require(
  "../models/queue.model"
);

const Salon = require(
  "../models/salon.model"
);

const Service = require(
  "../models/service.model"
);

const User = require(
  "../models/user.model"
);

const getOwnerOverviewService =
  async (ownerId) => {
    const salons =
      await Salon.find({
        owner: ownerId,
      });

    const salonIds =
      salons.map(
        (salon) => salon._id
      );

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      tomorrow.getDate() + 1
    );

    const todayBookings =
      await Booking.countDocuments({
        salon: {
          $in: salonIds,
        },
        bookingDate: {
          $gte: today,
          $lt: tomorrow,
        },
      });

    const completedBookings =
      await Booking.countDocuments({
        salon: {
          $in: salonIds,
        },
        status: "completed",
      });

    const activeQueue =
      await Queue.countDocuments({
        salon: {
          $in: salonIds,
        },
        status: {
          $in: [
            "waiting",
            "in_service",
          ],
        },
      });

    const completed =
      await Booking.find({
        salon: {
          $in: salonIds,
        },
        status: "completed",
      });

    const totalRevenue =
      completed.reduce(
        (sum, booking) =>
          sum +
          booking.totalAmount,
        0
      );

    const totalReviews =
      salons.reduce(
        (sum, salon) =>
          sum +
          salon.totalReviews,
        0
      );

    const averageRating =
      salons.length
        ? salons.reduce(
            (sum, salon) =>
              sum +
              salon.rating,
            0
          ) / salons.length
        : 0;

    return {
      todayBookings,
      completedBookings,
      activeQueue,
      totalRevenue,
      averageRating:
        Number(
          averageRating.toFixed(
            1
          )
        ),
      totalReviews,
    };
  };

  const getRecentBookingsService =
  async (ownerId) => {
    const salons =
      await Salon.find({
        owner: ownerId,
      });

    const salonIds =
      salons.map(
        (salon) => salon._id
      );

    const bookings =
      await Booking.find({
        salon: {
          $in: salonIds,
        },
      })
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "service",
          "name price"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10);

    return bookings;
  };

  const getTopServicesService =
  async (ownerId) => {
    const salons =
      await Salon.find({
        owner: ownerId,
      });

    const salonIds =
      salons.map(
        (salon) => salon._id
      );

    const result =
      await Booking.aggregate([
        {
          $match: {
            salon: {
              $in: salonIds,
            },
          },
        },
        {
          $group: {
            _id: "$service",
            totalBookings: {
              $sum: 1,
            },
            revenue: {
              $sum:
                "$totalAmount",
            },
          },
        },
        {
          $sort: {
            totalBookings: -1,
          },
        },
        {
          $limit: 5,
        },
      ]);
 
      const serviceIds =
  result.map(
    (item) => item._id
  );

const services =
  await Service.find({
    _id: {
      $in: serviceIds,
    },
  });

return result.map(
  (item) => ({
    service:
      services.find(
        (s) =>
          s._id.toString() ===
          item._id.toString()
      )?.name,
    totalBookings:
      item.totalBookings,
    revenue:
      item.revenue,
  })
);

  };


  const getMonthlyRevenueService =
  async (ownerId) => {
    const salons =
      await Salon.find({
        owner: ownerId,
      });

    const salonIds =
      salons.map(
        (salon) => salon._id
      );

    const revenue =
      await Booking.aggregate([
        {
          $match: {
            salon: {
              $in: salonIds,
            },
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month:
                  "$bookingDate",
              },
              year: {
                $year:
                  "$bookingDate",
              },
            },
            revenue: {
              $sum:
                "$totalAmount",
            },
            bookings: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

    return revenue;
  };

  const getAdminOverviewService =
  async () => {
    const totalUsers =
      await User.countDocuments();

    const totalCustomers =
      await User.countDocuments({
        role: "customer",
      });

    const totalSalonOwners =
      await User.countDocuments({
        role: "salon_owner",
      });

    const totalSalons =
      await Salon.countDocuments();

    const approvedSalons =
      await Salon.countDocuments({
        isApproved: true,
      });

    const pendingSalons =
      await Salon.countDocuments({
        isApproved: false,
      });

    const totalBookings =
      await Booking.countDocuments();

    const completedBookings =
      await Booking.countDocuments({
        status: "completed",
      });

    const completed =
      await Booking.find({
        status: "completed",
      });

    const totalRevenue =
      completed.reduce(
        (sum, booking) =>
          sum +
          booking.totalAmount,
        0
      );

    return {
      totalUsers,
      totalCustomers,
      totalSalonOwners,
      totalSalons,
      approvedSalons,
      pendingSalons,
      totalBookings,
      completedBookings,
      totalRevenue,
    };
  };
  
  const getRecentSalonsService =
  async () => {
    return await Salon.find()
      .populate(
        "owner",
        "name email"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);
  };
  const getRecentUsersService =
  async () => {
    return await User.find()
      .select(
        "name email role createdAt"
      )
      .sort({
        createdAt: -1,
      })
      .limit(10);
  };
 
  const getTopSalonsService =
  async () => {
    return await Salon.find()
      .populate(
        "owner",
        "name email"
      )
      .sort({
        rating: -1,
        totalReviews: -1,
      })
      .limit(10);
  };

  const getPlatformRevenueService =
  async () => {
    const revenue =
      await Booking.aggregate([
        {
          $match: {
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              month: {
                $month:
                  "$bookingDate",
              },
              year: {
                $year:
                  "$bookingDate",
              },
            },
            revenue: {
              $sum:
                "$totalAmount",
            },
            bookings: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

    return revenue;
  };

module.exports = {
  getOwnerOverviewService,
  getRecentBookingsService,
  getTopServicesService,
   getMonthlyRevenueService,
   getAdminOverviewService,
  getRecentSalonsService,
  getRecentUsersService,
  getTopSalonsService,
  getPlatformRevenueService
};