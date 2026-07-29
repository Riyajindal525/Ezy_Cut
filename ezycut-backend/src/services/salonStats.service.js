const Booking = require("../models/booking.model");
const mongoose = require("mongoose");

const ACTIVE_STATUSES = ["confirmed", "completed"]; // exclude pending/cancelled/no_show from "real" activity

const getSalonStatsService = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 1. Trending count — bookings per salon in the last 7 days
  const trending = await Booking.aggregate([
    {
      $match: {
        status: { $in: ACTIVE_STATUSES },
        createdAt: { $gte: sevenDaysAgo },
      },
    },
    {
      $group: {
        _id: "$salon",
        recentBookingCount: { $sum: 1 },
      },
    },
  ]);

  // 2. Top service per salon — most-booked service, all-time
  const topServices = await Booking.aggregate([
    { $match: { status: { $in: ACTIVE_STATUSES } } },
    {
      $group: {
        _id: { salon: "$salon", service: "$service" },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    {
      $group: {
        _id: "$_id.salon",
        topServiceId: { $first: "$_id.service" },
      },
    },
    {
      $lookup: {
        from: "services", // collection name — adjust if your Service model uses a different collection name
        localField: "topServiceId",
        foreignField: "_id",
        as: "serviceDoc",
      },
    },
    {
      $project: {
        topServiceName: { $arrayElemAt: ["$serviceDoc.name", 0] },
      },
    },
  ]);

  // 3. Last booked timestamp per salon — most recent booking, all-time
  const lastBooked = await Booking.aggregate([
    { $match: { status: { $in: ACTIVE_STATUSES } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$salon",
        lastBookedAt: { $first: "$createdAt" },
      },
    },
  ]);

  // Merge all three into a single map keyed by salonId
  const statsMap = {};

  trending.forEach((t) => {
    statsMap[t._id.toString()] = {
      ...(statsMap[t._id.toString()] || {}),
      recentBookingCount: t.recentBookingCount,
    };
  });

  topServices.forEach((t) => {
    if (!t.topServiceName) return;
    statsMap[t._id.toString()] = {
      ...(statsMap[t._id.toString()] || {}),
      topServiceName: t.topServiceName,
    };
  });

  lastBooked.forEach((t) => {
    statsMap[t._id.toString()] = {
      ...(statsMap[t._id.toString()] || {}),
      lastBookedAt: t.lastBookedAt,
    };
  });

  return statsMap; // { salonId: { recentBookingCount, topServiceName, lastBookedAt } }
};

module.exports = { getSalonStatsService };