import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  name:      String,
  roll:      String,
  color:     String,
}, { _id: false });

const groupSchema = new mongoose.Schema({
  id:            Number,
  members:       [memberSchema],
  coordinatorId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  meetLink:      String,
  isFour:        { type: Boolean, default: false },
}, { _id: false });

const sessionSchema = new mongoose.Schema(
  {
    dateKey:     { type: String, required: true, unique: true },
    groups:      [groupSchema],
    published:   { type: Boolean, default: false },
    publishedAt: { type: Date },
    groupSize:   { type: Number, default: 3 },  // ✅ added
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);