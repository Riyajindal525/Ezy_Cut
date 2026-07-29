const Notification = require("../models/notification.model");
const { getIO } = require("../config/socket");

const createNotificationService = async (
  user,
  title,
  message,
  type = "system"
) => {
  const notification = await Notification.create({
    user,
    title,
    message,
    type,
  });

  // 👇 Emit real-time event to this user's room (if socket server is up)
  try {
    const io = getIO();
    io.to(user.toString()).emit("notification", {
      _id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      createdAt: notification.createdAt,
    });
  } catch (err) {
    // socket.io not initialized (e.g. during tests) — don't crash notification creation
    console.error("Socket emit failed:", err.message);
  }

  return notification;
};

const getNotificationsService = async (userId) => {
  return await Notification.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
};

const markAsReadService = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

const markAllAsReadService = async (userId) => {
  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );

  return true;
};

module.exports = {
  createNotificationService,
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
};