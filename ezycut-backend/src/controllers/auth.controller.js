const asyncHandler = require("../utils/asyncHandler");

const generateToken = require("../utils/generateToken");

const {
  registerUser,
  loginUser,
} = require("../services/auth.service");

const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await loginUser(email, password);

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
});

module.exports = {
  register,
  login,
};