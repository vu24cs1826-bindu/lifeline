import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    incident: { type: mongoose.Schema.Types.ObjectId, ref: "EmergencyIncident", required: true, index: true },
    responder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["notified", "accepted", "declined", "expired", "cancelled", "completed"],
      default: "notified",
      index: true,
    },
    distanceKm: Number,
    score: Number,
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // set when an admin assigns manually
    notifiedAt: { type: Date, default: Date.now },
    respondedAt: Date,
    declineReason: { type: String, maxlength: 200 },
  },
  { timestamps: true }
);
assignmentSchema.index({ incident: 1, responder: 1 }, { unique: true });

export default mongoose.model("ResponderAssignment", assignmentSchema);
