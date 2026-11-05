import mongoose from "mongoose";
import { BLOOD_GROUPS } from "./BloodDonor.js";

const requestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "BloodDonor", required: true, index: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
    hospital: { type: String, trim: true, maxlength: 120 },
    message: { type: String, trim: true, maxlength: 300 },
    urgency: { type: String, enum: ["normal", "urgent"], default: "normal" },
    status: { type: String, enum: ["pending", "accepted", "declined", "cancelled"], default: "pending", index: true },
    respondedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("DonationRequest", requestSchema);
