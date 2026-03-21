import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(admin._id);
    res.json({ token, email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/register  — only works if NO admin exists yet (first-time setup)
router.post("/register", async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0)
      return res.status(403).json({ message: "Admin already exists. Use login." });

    const { email, password } = req.body;
    const admin = await Admin.create({ email, password });
    const token = signToken(admin._id);
    res.status(201).json({ token, email: admin.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;