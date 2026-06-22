const asyncHandler =
  require(
    "../utils/asyncHandler"
  );

const {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService,
} = require(
  "../services/notification.service"
);

const getNotifications =
  asyncHandler(async (
    req,
    res
  ) => {
    const notifications =
      await getNotificationsService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count:
        notifications.length,
      notifications,
    });
  });

const markAsRead =
  asyncHandler(async (
    req,
    res
  ) => {
    const notification =
      await markAsReadService(
        req.params.id,
        req.user._id
      );

    res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      notification,
    });
  });

const markAllAsRead =
  asyncHandler(async (
    req,
    res
  ) => {
    await markAllAsReadService(
      req.user._id
    );

    res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  });

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};