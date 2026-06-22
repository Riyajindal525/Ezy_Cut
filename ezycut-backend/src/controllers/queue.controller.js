const asyncHandler = require(
  "../utils/asyncHandler"
);

const {
  joinQueueService,
   getMyQueueStatusService,
   getSalonQueueService,
    startServiceQueueService,
    completeQueueService,
     cancelQueueService,
      getQueueByTokenService, 
} = require(
  "../services/queue.service"
);

const joinQueue =
  asyncHandler(async (
    req,
    res
  ) => {
    const queue =
      await joinQueueService(
        req.body.bookingId,
        req.user._id
      );

    res.status(201).json({
      success: true,
      message:
        "Joined queue successfully",
      queue,
    });
  });

const getMyQueueStatus =
  asyncHandler(async (
    req,
    res
  ) => {

    const queues =
      await getMyQueueStatusService(
        req.user._id
      );

    res.status(200).json({
      success: true,
      count:
        queues.length,
      queues,
    });
  });

  const getSalonQueue =
  asyncHandler(async (
    req,
    res
  ) => {
    const queue =
      await getSalonQueueService(
        req.params.salonId
      );

    res.status(200).json({
      success: true,
      count: queue.length,
      queue,
    });
  });
  

  const startService =
  asyncHandler(async (
    req,
    res
  ) => {
    const queue =
      await startServiceQueueService(
        req.queue
      );

    res.status(200).json({
      success: true,
      message:
        "Service started successfully",
      queue,
    });
  });

  const completeQueue =
  asyncHandler(async (
    req,
    res
  ) => {
    const queue =
      await completeQueueService(
        req.queue
      );

    res.status(200).json({
      success: true,
      message:
        "Queue completed successfully",
      queue,
    });
  });

  const cancelQueue =
  asyncHandler(async (
    req,
    res
  ) => {
    const queue =
      await cancelQueueService(
        req.queue
      );

    res.status(200).json({
      success: true,
      message:
        "Queue cancelled successfully",
      queue,
    });
  });

  const getQueueByToken =
  asyncHandler(async (
    req,
    res
  ) => {
    const queue =
      await getQueueByTokenService(
        req.params.tokenCode
      );

    res.status(200).json({
      success: true,
      queue,
    });
  });
  
module.exports = {
  joinQueue,
   getMyQueueStatus,
   getSalonQueue,
     startService,
       completeQueue,
      cancelQueue, 
    getQueueByToken      
};