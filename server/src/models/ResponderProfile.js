import mongoose from "mongoose";

export const SKILLS = ["first_aid", "cpr", "firefighting", "driving", "ambulance", "rescue", "counselling", "blood_donation_support"];

const responderProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
    skills: [{ type: String, enum: SKILLS }],
    qualification: { type: String, trim: true, maxlength: 200 },
    available: { type: Boolean, default: false },
    // Mirrors the user's verification so matching needs only one query
    verified: { type: Boolean, default: false, index: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
    locationUpdatedAt: Date,
    completedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
responderProfileSchema.index({ location: "2dsphere" });

export default mongoose.model("ResponderProfile", responderProfileSchema);
