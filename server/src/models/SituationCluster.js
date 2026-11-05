import mongoose from "mongoose";

const situationClusterSchema = new mongoose.Schema(
  {
    clusterId: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["urban_flooding", "multi_vehicle_accident", "fire_conflagration", "infrastructure_failure", "mass_gathering_hazard", "chemical_leak", "storm_hazard", "general_crisis"],
      default: "general_crisis",
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.5 },
    center: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    radiusMeters: { type: Number, default: 500 },
    incidentCount: { type: Number, default: 1 },
    incidents: [{ type: mongoose.Schema.Types.ObjectId, ref: "EmergencyIncident" }],
    communityReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "CommunityReport" }],
    evidenceSources: [
      {
        sourceType: { type: String, enum: ["citizen_sos", "community_hazard", "weather_telemetry", "traffic_sensor", "official_dispatch"] },
        count: { type: Number, default: 1 },
        summary: String,
      },
    ],
    firstObservedAt: { type: Date, default: Date.now },
    lastObservedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["developing", "escalating", "stabilized", "contained", "resolved", "dismissed"],
      default: "developing",
      index: true,
    },
    recommendedVerificationActions: [String],
    predictedImpact: String,
    moderated: { type: Boolean, default: false },
    moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

situationClusterSchema.index({ center: "2dsphere" });
situationClusterSchema.index({ status: 1, severity: 1 });

export default mongoose.model("SituationCluster", situationClusterSchema);
