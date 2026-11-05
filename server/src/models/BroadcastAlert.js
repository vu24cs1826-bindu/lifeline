import mongoose from "mongoose";

const broadcastAlertSchema = new mongoose.Schema(
  {
    alertCode: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    channel: {
      type: String,
      enum: ["whatsapp_and_sms", "sms_only", "whatsapp_only", "siren_and_push"],
      default: "whatsapp_and_sms",
    },
    severity: {
      type: String,
      enum: ["advisory", "warning", "evacuation_order"],
      default: "warning",
    },
    message: { type: String, required: true },
    targetArea: { type: String, required: true },
    radiusKm: { type: Number, default: 3 },
    estimatedRecipients: { type: Number, default: 1250 },
    deliveredCount: { type: Number, default: 1224 },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("BroadcastAlert", broadcastAlertSchema);
