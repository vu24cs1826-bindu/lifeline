import mongoose from "mongoose";

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const donorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    city: { type: String, required: true, trim: true, maxlength: 80, index: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
    available: { type: Boolean, default: true },
    lastDonationDate: Date,
  },
  { timestamps: true }
);
donorSchema.index({ location: "2dsphere" });

export default mongoose.model("BloodDonor", donorSchema);
