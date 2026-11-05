import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    incident: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyIncident", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);
messageSchema.index({ incident: 1, createdAt: 1 });

export default mongoose.model("IncidentMessage", messageSchema);
