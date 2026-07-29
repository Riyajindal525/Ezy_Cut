const SalonOpenReminder = require("../models/salonOpenReminder.model");
const User = require("../models/user.model"); // adjust path if different

const subscribeToOpenReminderService = async (salonId, customerId) => {
  // upsert — agar already subscribed hai to duplicate error na aaye
  const reminder = await SalonOpenReminder.findOneAndUpdate(
    { salon: salonId, customer: customerId },
    { salon: salonId, customer: customerId, notified: false },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return reminder;
};

/* Called when a salon flips isOpen: false → true.
   Emails every pending subscriber, then clears their reminders. */
const notifyPendingCustomersService = async (salon) => {
  const pending = await SalonOpenReminder.find({
    salon: salon._id,
    notified: false,
  }).populate("customer", "name email");

  if (pending.length === 0) return;

  const { sendSalonReopenedEmail } = require("../utils/emailer"); // added in emailer.js below

  for (const reminder of pending) {
    if (!reminder.customer?.email) continue;
    try {
      await sendSalonReopenedEmail(reminder.customer, salon);
      reminder.notified = true;
      await reminder.save();
    } catch (err) {
      console.error(`[SALON REOPEN EMAIL FAILED] for ${reminder.customer.email}:`, err.message);
      // don't throw — one failure shouldn't block others
    }
  }

  // Clean up notified reminders so future close/open cycles start fresh
  await SalonOpenReminder.deleteMany({ salon: salon._id, notified: true });
};

module.exports = {
  subscribeToOpenReminderService,
  notifyPendingCustomersService,
};