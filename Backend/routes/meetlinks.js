import express from "express";
import MeetLink from "../models/MeetLink.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/meetlinks
router.get("/", protect, async (req, res) => {
  try {
    const links = await MeetLink.find().sort({ createdAt: 1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/meetlinks
router.post("/", protect, async (req, res) => {
  try {
    const link = await MeetLink.create({ url: req.body.url });
    res.status(201).json(link);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/meetlinks/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await MeetLink.findByIdAndDelete(req.params.id);
    res.json({ message: "Link deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;