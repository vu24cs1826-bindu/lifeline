import mongoose from "mongoose";

const facilitySchema = new mongoose.Schema(
  {
    facilityCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["hospital", "trauma_center", "blood_bank", "fire_station", "emergency_shelter", "ambulance_depot"],
      required: true,
      index: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    operatingStatus: {
      type: String,
      enum: ["operational", "high_capacity", "overcrowded", "diverting", "offline"],
      default: "operational",
      index: true,
    },
    // Capacity metrics
    totalBeds: { type: Number, default: 0 },
    availableBeds: { type: Number, default: 0 },
    icuBedsTotal: { type: Number, default: 0 },
    icuBedsAvailable: { type: Number, default: 0 },
    oxygenCylindersAvailable: { type: Number, default: 0 },
    ambulancesReady: { type: Number, default: 0 },
    bloodInventory: {
      "A+": { type: Number, default: 12 },
      "A-": { type: Number, default: 6 },
      "B+": { type: Number, default: 15 },
      "B-": { type: Number, default: 4 },
      "AB+": { type: Number, default: 8 },
      "AB-": { type: Number, default: 2 },
      "O+": { type: Number, default: 20 },
      "O-": { type: Number, default: 5 },
    },
    specialties: [String], // e.g. ["burn_unit", "neurosurgery", "pediatric_icu", "cardiac_cath_lab", "boat_rescue"]
    traumaLevel: { type: Number, min: 1, max: 4, default: 2 }, // 1 = Highest tertiary care
  },
  { timestamps: true }
);

facilitySchema.index({ location: "2dsphere" });

export default mongoose.model("Facility", facilitySchema);
