const Queue = require(
  "../models/queue.model"
);

const Booking = require(
  "../models/booking.model"
);

const {
  createNotificationService,
} = require(
  "./notification.service"
);

const recalculateQueue =
  async (salonId) => {

    const queues =
      await Queue.find({
        salon: salonId,
        status: "waiting",
      })
      .populate("service")
      .sort({
        tokenNumber: 1,
      });

    let totalWait = 0;

    for (
      let i = 0;
      i < queues.length;
      i++
    ) {

      queues[i].position =
        i + 1;

      queues[i].estimatedWaitTime =
        totalWait;

      totalWait +=
        queues[i].service.duration;

      await queues[i].save();
    }
  };

const joinQueueService =
  async (
    bookingId,
    customerId
  ) => {
    const booking =
      await Booking.findById(
        bookingId
      ).populate("service");

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }

    if (
      booking.customer.toString() !==
      customerId.toString()
    ) {
      throw new Error(
        "Not authorized"
      );
    }

    if (
      booking.status !==
      "confirmed"
    ) {
      throw new Error(
        "Only confirmed bookings can join queue"
      );
    }

    

    const activeQueue =
  await Queue.findOne({
    customer: customerId,
    status: {
      $in: [
        "waiting",
        "in_service",
      ],
    },
  });

if (activeQueue) {
  throw new Error(
    "You already have an active queue"
  );
}

    const existingQueue =
      await Queue.findOne({
        booking: bookingId,
        status: {
          $in: [
            "waiting",
            "in_service",
          ],
        },
      });

    if (existingQueue) {
      throw new Error(
        "Already in queue"
      );
    }

    const totalWaiting =
      await Queue.countDocuments({
        salon: booking.salon,
        status: "waiting",
      });

    const lastToken =
      await Queue.findOne({
        salon: booking.salon,
      }).sort({
        tokenNumber: -1,
      });

    const tokenNumber =
      lastToken
        ? lastToken.tokenNumber + 1
        : 1;

    const tokenCode =
      `S${booking.salon
        .toString()
        .slice(-4)
        .toUpperCase()}-${String(
        tokenNumber
      ).padStart(3, "0")}`;

    const estimatedWaitTime =
      totalWaiting *
      booking.service.duration;

    const queue =
      await Queue.create({
        salon: booking.salon,

        customer:
          booking.customer,

        booking:
          booking._id,

        service:
          booking.service._id,

        tokenNumber,

        tokenCode,

        position:
          totalWaiting + 1,

        estimatedWaitTime,

        status: "waiting",
      });

    await createNotificationService(
      booking.customer,
      "Queue Joined",
      `You have joined the queue for ${booking.service.name}. Your estimated wait time is ${estimatedWaitTime} minutes.`,
      "queue"
    );

    return queue;
  };

const calculatePosition =
  async (queue) => {
    const position =
      await Queue.countDocuments({
        salon: queue.salon,
        status: {
          $in: [
            "waiting",
            "in_service",
          ],
        },
        tokenNumber: {
          $lt: queue.tokenNumber,
        },
      });

    return position + 1;
  };

const getMyQueueStatusService =
  async (customerId) => {

    const queues =
      await Queue.find({
        customer: customerId,
        status: {
          $in: [
            "waiting",
            "in_service",
          ],
        },
      })
        .populate(
          "salon",
          "name"
        )
        .populate(
  "service",
  "name duration price"
)
.populate(
  "booking",
  "bookingDate startTime endTime status"
)
        .sort({
          createdAt: -1,
        });

    const updatedQueues = [];

    for (const item of queues) {

      const queueObj =
        item.toObject();

      queueObj.position =
        await calculatePosition(
          queueObj
        );

      updatedQueues.push(
        queueObj
      );
    }

    return updatedQueues;
  };

const getSalonQueueService =
  async (salonId) => {
    const queue =
      await Queue.find({
        salon: salonId,
        status: {
          $in: [
            "waiting",
            "in_service",
          ],
        },
      })
        .populate(
          "customer",
          "name phone"
        )
        .populate(
          "service",
          "name duration price"
        )
        .sort({
          tokenNumber: 1,
        });

    const updatedQueue = [];

    for (const item of queue) {
      const queueObj =
        item.toObject();

      queueObj.position =
        await calculatePosition(
          queueObj
        );

      updatedQueue.push(
        queueObj
      );
    }

    return updatedQueue;
  };
const startServiceQueueService =
  async (queue) => {

    if (
      queue.status ===
      "completed"
    ) {
      throw new Error(
        "Queue already completed"
      );
    }

    if (
      queue.status ===
      "in_service"
    ) {
      throw new Error(
        "Service already started"
      );
    }

    const existingService =
      await Queue.findOne({
        salon: queue.salon,
        status: "in_service",
      });

    if (existingService) {
      throw new Error(
        "Another customer is already in service"
      );
    }

    queue.status =
      "in_service";

    await queue.save();

    return queue;
  };

const completeQueueService =
  async (queue) => {

    if (
      queue.status !==
      "in_service"
    ) {
      throw new Error(
        "Only in-service queue can be completed"
      );
    }

    queue.status =
      "completed";

    await queue.save();

    await recalculateQueue(
      queue.salon
    );

    return queue;
  };

const cancelQueueService =
  async (queue) => {

    if (
      queue.status ===
      "completed"
    ) {
      throw new Error(
        "Completed queue cannot be cancelled"
      );
    }

    if (
      queue.status ===
      "cancelled"
    ) {
      throw new Error(
        "Queue already cancelled"
      );
    }

    queue.status =
      "cancelled";

    await queue.save();

    await recalculateQueue(
      queue.salon
    );

    return queue;
  };

const getQueueByTokenService =
  async (tokenCode) => {
    let queue =
      await Queue.findOne({
        tokenCode,
      })
        .populate(
          "salon",
          "name"
        )
        .populate(
          "service",
          "name duration"
        );

    if (!queue) {
      throw new Error(
        "Queue not found"
      );
    }

    queue = queue.toObject();

    queue.position =
      await calculatePosition(
        queue
      );

    return queue;
  };

module.exports = {
  joinQueueService,
  getMyQueueStatusService,
  getSalonQueueService,
  startServiceQueueService,
  completeQueueService,
  cancelQueueService,
  getQueueByTokenService,
};