const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

function safeCustomer(customer) {
  return {
    _id: customer._id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone
  };
}

async function register(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must contain at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await Customer.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone.trim()
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: safeCustomer(customer)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const customer = await Customer.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = customer
      ? await bcrypt.compare(password, customer.password)
      : false;

    if (!customer || !passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(customer._id.toString());

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({ success: true, message: "Login successful" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function getMe(req, res) {
  try {
    const customer = await Customer.findById(req.user.id).select("-password");

    if (!customer) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    return res.json({
      _id: customer._id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  return res.json({ success: true, message: "Logged out successfully" });
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must contain at least 6 characters" });
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const matches = await bcrypt.compare(oldPassword, customer.password);
    if (!matches) {
      return res.status(401).json({ success: false, message: "Old password is incorrect" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { register, login, getMe, logout, changePassword };