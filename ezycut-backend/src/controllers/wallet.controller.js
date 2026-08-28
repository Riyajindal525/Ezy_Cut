const walletService = require("../services/wallet.service");

const getBalance = async (req, res, next) => {
  try {
    const wallet = await walletService.getBalance(req.user._id);
    return res.status(200).json({
      success: true,
      balance: wallet.available_balance,
      pending: wallet.pending_balance,
      blocked: wallet.blocked_balance,
      status: wallet.status,
    });
  } catch (error) {
    next(error);
  }
};

const getLedger = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await walletService.getLedger(req.user._id, page, limit);
    return res.status(200).json({
      success: true,
      entries: result.entries,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBalance,
  getLedger,
};
