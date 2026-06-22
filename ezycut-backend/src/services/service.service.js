const Service = require("../models/service.model");
const Salon = require("../models/salon.model");

const createServiceService = async (
  data,
  salon
) => {
  const service = await Service.create({
    salon: salon._id,

    name: data.name,

    description:
      data.description || "",

    price: data.price,

    duration: data.duration,

    category:
      data.category || "General",
  });

  salon.services.push(
    service._id
  );

  await salon.save();

  return service;
};

const getServicesBySalonService =
  async (salonId) => {
    return await Service.find({
      salon: salonId,
    }).sort({
      createdAt: -1,
    });
  };

const getServiceByIdService =
  async (serviceId) => {
    return await Service.findById(
      serviceId
    );
  };

const updateServiceService =
  async (service, data) => {
    const allowedFields = [
      "name",
      "description",
      "price",
      "duration",
      "category",
      "isActive",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          data[field] !== undefined
        ) {
          service[field] =
            data[field];
        }
      }
    );

    await service.save();

    return service;
  };

const deleteServiceService =
  async (service) => {
    const salon =
      await Salon.findById(
        service.salon
      );

    if (salon) {
      salon.services =
        salon.services.filter(
          (serviceId) =>
            serviceId.toString() !==
            service._id.toString()
        );

      await salon.save();
    }

    await service.deleteOne();

    return true;
  };

module.exports = {
  createServiceService,
  getServicesBySalonService,
  getServiceByIdService,
  updateServiceService,
  deleteServiceService,
};