import mongoose from "mongoose";

const riskZoneSchema = new mongoose.Schema(
  {
    zoneCode: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    sector: { type: String, required: true }, // e.g. "North Sector", "Highway Corridor"
    center: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    radiusMeters: { type: Number, default: 1200 },
    baselineRisk: { type: Number, min: 0, max: 100, default: 35 }, // Historical baseline (Poisson / rate-based)
    predictedRisk: { type: Number, min: 0, max: 100, default: 45 }, // Multi-factor dynamic model
    riskLevel: {
      type: String,
      enum: ["low", "moderate", "elevated", "severe"],
      default: "moderate",
      index: true,
    },
    factors: {
      historicalIncidentDensity: { type: Number, default: 30 }, // 0 - 100
      weatherVulnerability: { type: Number, default: 40 },      // 0 - 100 (e.g. rain/flood susceptibility)
      trafficCongestion: { type: Number, default: 50 },         // 0 - 100
      infrastructureDeficit: { type: Number, default: 35 },     // 0 - 100 (e.g. poor lighting, drainage)
      responseRemoteness: { type: Number, default: 25 },        // 0 - 100 (latency to nearest station)
    },
    factorWeights: {
      type: Map,
      of: Number,
      default: {
        historicalIncidentDensity: 0.25,
        weatherVulnerability: 0.30,
        trafficCongestion: 0.20,
        infrastructureDeficit: 0.15,
        responseRemoteness: 0.10,
      },
    },
    explainability: {
      primaryDriver: String,
      confidenceScore: { type: Number, default: 0.85 },
      insights: [String],
    },
    recommendedMitigations: [String],
    historicalIncidentCount: { type: Number, default: 0 },
    lastEvaluatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

riskZoneSchema.index({ center: "2dsphere" });

export default mongoose.model("RiskZone", riskZoneSchema);
