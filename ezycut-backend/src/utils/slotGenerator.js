const generateSlots = (
  openingTime,
  closingTime,
  duration
) => {
  const slots = [];

  const open = new Date(
    `1970-01-01 ${openingTime}`
  );

  const close = new Date(
    `1970-01-01 ${closingTime}`
  );

  while (open < close) {
    slots.push(
      open.toTimeString().slice(0, 5)
    );

    open.setMinutes(
      open.getMinutes() + duration
    );
  }

  return slots;
};

module.exports = generateSlots;