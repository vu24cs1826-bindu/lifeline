import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    type: { type: String, enum: ["ngo", "hospital", "fire_service", "ambulance", "community", "other"], default: "other" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    city: { type: String, trim: true, maxlength: 80 },
    contactPhone: { type: String, trim: true, maxlength: 20 },
    status: { type: String, enum: ["pending", "verified", "rejected", "suspended"], default: "pending", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Organization", organizationSchema);
