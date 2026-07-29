const asyncHandler = require("../utils/asyncHandler");
const { subscribeToOpenReminderService } = require("../services/salonReminder.service");

const subscribeToOpenReminder = asyncHandler(async (req, res) => {
  await subscribeToOpenReminderService(req.params.salonId, req.user._id);

  res.status(200).json({
    success: true,
    message: "You'll be emailed when this salon opens.",
  });
});

module.exports = { subscribeToOpenReminder };