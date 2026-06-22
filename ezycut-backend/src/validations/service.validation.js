const validateService = (
  req,
  res,
  next
) => {
  const {
    salonId,
    name,
    price,
    duration,
  } = req.body;

  if (
    !salonId ||
    !name ||
    !price ||
    !duration
  ) {
    return res.status(400).json({
      success: false,
      message:
        "salonId, name, price and duration are required",
    });
  }

  next();
};

module.exports = {
  validateService,
};