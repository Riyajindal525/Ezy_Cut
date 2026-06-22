const Salon = require("../models/salon.model");

const createSalonService = async (
  data,
  user
) => {
  const ownerId =
    user.role === "admin" && data.ownerId
      ? data.ownerId
      : user._id;

  const salon = await Salon.create({
    owner: ownerId,

    createdBy: user._id,

    name: data.name,
    description: data.description,
    address: data.address,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    phone: data.phone,

    openingTime:
      data.openingTime || "09:00 AM",

    closingTime:
      data.closingTime || "09:00 PM",

    location: {
      type: "Point",
      coordinates: [
        Number(data.longitude),
        Number(data.latitude),
      ],
    },
  });

  return salon;
};

const getAllSalonsService = async () => {
  return await Salon.find()
    .populate(
      "owner",
      "name email phone"
    )
    .sort({
      createdAt: -1,
    });
};

const getSalonByIdService = async (
  salonId
) => {
  return await Salon.findById(
    salonId
  ).populate(
    "owner",
    "name email phone"
  );
};

const getNearbySalonsService = async (
  longitude,
  latitude,
  radius = 5000
) => {
  return await Salon.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [
            Number(longitude),
            Number(latitude),
          ],
        },
        $maxDistance:
          Number(radius),
      },
    },
  });
};

const updateSalonService = async (
  salon,
  data
) => {
  Object.assign(salon, data);

  await salon.save();

  return salon;
};

const deleteSalonService = async (
  salon
) => {
  await salon.deleteOne();

  return true;
};

const assignOwnerService = async (
  salonId,
  ownerId
) => {
  const salon =
    await Salon.findByIdAndUpdate(
      salonId,
      {
        owner: ownerId,
      },
      {
        new: true,
      }
    );

  if (!salon) {
    throw new Error(
      "Salon not found"
    );
  }

  return salon;
};

module.exports = {
  createSalonService,
  getAllSalonsService,
  getSalonByIdService,
  getNearbySalonsService,
  updateSalonService,
  deleteSalonService,
  assignOwnerService,
};