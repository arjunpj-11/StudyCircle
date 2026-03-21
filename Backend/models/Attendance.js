import mongoose from "mongoose";

// records: [{ studentId, status: "P"|"A"|"F" }]
const attendanceSchema = new mongoose.Schema(
  {
    dateKey: { type: String, required: true, unique: true }, // "YYYY-MM-DD"
    records: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
        status:    { type: String, enum: ["P", "A", "F"], required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);