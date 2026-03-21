import express from "express";
import Attendance from "../models/Attendance.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/attendance/:dateKey  — get one day
router.get("/:dateKey", protect, async (req, res) => {
  try {
    const doc = await Attendance.findOne({ dateKey: req.params.dateKey });
    res.json(doc || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/attendance  — get ALL days (for records page)
router.get("/", protect, async (req, res) => {
  try {
    const docs = await Attendance.find().sort({ dateKey: 1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/attendance/:dateKey  — save/overwrite a day
router.put("/:dateKey", protect, async (req, res) => {
  try {
    const { records } = req.body; // [{ studentId, status }]
    const doc = await Attendance.findOneAndUpdate(
      { dateKey: req.params.dateKey },
      { dateKey: req.params.dateKey, records },
      { upsert: true, new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;