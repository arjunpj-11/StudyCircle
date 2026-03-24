import express from "express";
import Session from "../models/Session.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/sessions/:dateKey  — admin: full session
router.get("/:dateKey", protect, async (req, res) => {
  try {
    const session = await Session.findOne({ dateKey: req.params.dateKey });
    res.json(session || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sessions/:dateKey/public  — students: only published
router.get("/:dateKey/public", async (req, res) => {
  try {
    const session = await Session.findOne({ dateKey: req.params.dateKey, published: true });
    res.json(session || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/sessions/:dateKey  — save/overwrite groups
router.put("/:dateKey", protect, async (req, res) => {
  try {
    const { groups, published, groupSize } = req.body;  // ✅ extract groupSize
    const session = await Session.findOneAndUpdate(
      { dateKey: req.params.dateKey },
      { dateKey: req.params.dateKey, groups, published: published ?? false, groupSize: groupSize ?? 3 },  // ✅ save it
      { upsert: true, new: true }
    );
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/sessions/:dateKey/publish  — flip published flag
router.patch("/:dateKey/publish", protect, async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { dateKey: req.params.dateKey },
      { published: true, publishedAt: new Date() },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;