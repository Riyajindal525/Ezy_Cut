const Notification = require(
  "../models/notification.model"
);

const createNotificationService =
  async (
    user,
    title,
    message,
    type = "system"
  ) => {
    return await Notification.create({
      user,
      title,
      message,
      type,
    });
  };

const getNotificationsService =
  async (userId) => {
    return await Notification.find({
      user: userId,
    }).sort({
      createdAt: -1,
    });
  };

const markAsReadService =
  async (
    notificationId,
    userId
  ) => {
    const notification =
      await Notification.findOne({
        _id: notificationId,
        user: userId,
      });

    if (!notification) {
      throw new Error(
        "Notification not found"
      );
    }

    notification.isRead = true;

    await notification.save();

    return notification;
  };

const markAllAsReadService =
  async (userId) => {
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