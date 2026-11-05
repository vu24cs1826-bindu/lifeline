import mongoose from "mongoose";

export const REPORT_CATEGORIES = [
  "accident_prone_road", "broken_streetlight", "flooded_road", "dangerous_location", "fire_hazard", "other",
];

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: REPORT_CATEGORIES, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 800 },
    address: { type: String, trim: true, maxlength: 200 },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    images: [String],
    status: { type: String, enum: ["pending", "verified", "rejected", "resolved"], default: "pending", index: true },
    moderator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    moderationNote: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);
reportSchema.index({ location: "2dsphere" });

export default mongoose.model("CommunityReport", reportSchema);
