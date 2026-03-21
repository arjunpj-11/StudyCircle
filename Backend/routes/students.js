import express from "express";
import Student from "../models/Student.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// GET /api/students
router.get("/", protect, async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/students
router.post("/", protect, async (req, res) => {
  try {
    const { name, roll, color } = req.body;
    const student = await Student.create({ name, roll, color });
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/students/:id
router.patch("/:id", protect, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/students/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/students/increment-sessions  — bulk update after publish
router.post("/increment-sessions", protect, async (req, res) => {
  try {
    const { groups } = req.body; // [{ members:[{studentId}], coordinatorId }]
    const ops = [];

    groups.forEach(({ members, coordinatorId }) => {
      members.forEach(({ studentId }) => {
        const isCoord = String(studentId) === String(coordinatorId);
        ops.push({
          updateOne: {
            filter: { _id: studentId },
            update: {
              $inc: {
                totalSessions: 1,
                ...(isCoord ? { coordSessions: 1 } : {}),
              },
            },
          },
        });
      });
    });

    if (ops.length) await Student.bulkWrite(ops);
    res.json({ message: "Sessions incremented" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;