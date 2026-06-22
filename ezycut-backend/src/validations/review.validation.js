const Joi = require("joi");

const validateReview = (
  req,
  res,
  next
) => {
  const schema = Joi.object({
    bookingId: Joi.string()
      .required(),

    rating: Joi.number()
      .min(1)
      .max(5)
      .required(),

    comment: Joi.string()
      .allow("")
      .optional(),
  });

  const { error } =
    schema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message:
        error.details[0].message,
    });
  }

  next();
};

module.exports = {
  validateReview,
};