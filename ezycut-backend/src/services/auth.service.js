const bcrypt = require("bcryptjs");

const User = require("../models/user.model");

const registerUser = async (data) => {
  const { name, email, phone, password, role } = data;

  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role: role || "customer",
  });

  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isPasswordMatched = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid credentials");
  }

  return user;
};

module.exports = {
  registerUser,
  loginUser,
};