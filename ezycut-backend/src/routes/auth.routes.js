const express = require("express");

const router = express.Router();

const {
  register,
  login,
} = require("../controllers/auth.controller");

const {
  validateRegister,
} = require("../validations/auth.validation");

router.post("/register", validateRegister, register);

router.post("/login", login);

module.exports = router;