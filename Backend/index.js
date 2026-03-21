import express   from "express";
import mongoose  from "mongoose";
import cors      from "cors";
import dotenv    from "dotenv";

import authRoutes      from "./routes/auth.js";
import studentRoutes   from "./routes/students.js";
import attendanceRoutes from "./routes/attendance.js";
import sessionRoutes   from "./routes/sessions.js";
import meetLinkRoutes  from "./routes/meetlinks.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── Middleware ── */
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"], credentials: true }));
app.use(express.json());

/* ── Routes ── */
app.use("/api/auth",       authRoutes);
app.use("/api/students",   studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/sessions",   sessionRoutes);
app.use("/api/meetlinks",  meetLinkRoutes);

/* ── Health check ── */
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date() }));

/* ── Connect MongoDB + start server ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });