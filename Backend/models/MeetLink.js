import mongoose from "mongoose";

const meetLinkSchema = new mongoose.Schema(
  {
    url:  { type: String, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("MeetLink", meetLinkSchema);