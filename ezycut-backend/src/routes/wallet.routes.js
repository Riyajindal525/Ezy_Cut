const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth.middleware");
const { getBalance, getLedger } = require("../controllers/wallet.controller");

// All routes are protected and for logged in users
router.use(protect);

router.get("/balance", getBalance);
router.get("/ledger", getLedger);

module.exports = router;
