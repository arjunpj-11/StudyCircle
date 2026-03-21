import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    roll:          { type: String, required: true, trim: true, unique: true },
    color:         { type: String, default: "#c8602a" },
    status:        { type: String, enum: ["active", "frozen"], default: "active" },
    coordSessions: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);