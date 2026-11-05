import mongoose from "mongoose";

const simulationStepSchema = new mongoose.Schema(
  {
    tHours: { type: Number, required: true },
    spreadRadiusKm: { type: Number, required: true },
    projectedCasualties: { type: Number, required: true },
    projectedDisplacedPeople: { type: Number, default: 0 },
    hospitalBedUtilizationPercent: { type: Number, required: true },
    icuSaturationPercent: { type: Number, required: true },
    bloodDeficitUnits: { type: Number, default: 0 },
    bottlenecks: [String],
    recommendedDispatches: [
      {
        resourceType: String,
        quantity: Number,
        targetZone: String,
        objective: String,
      },
    ],
    evacuationRoutesStatus: [
      {
        route: String,
        status: { type: String, enum: ["open", "congested", "submerged", "blocked"] },
      },
    ],
  },
  { _id: false }
);

const simulationScenarioSchema = new mongoose.Schema(
  {
    scenarioId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["urban_flooding", "multi_vehicle_pileup", "hospital_resource_shortage", "industrial_fire", "cyclone_landfall"],
      required: true,
    },
    description: { type: String, required: true },
    center: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    initialConditions: {
      precipitationMmPerHour: { type: Number, default: 0 },
      ambientWindKmh: { type: Number, default: 15 },
      trafficLoadFactor: { type: Number, default: 1.0 }, // 1.0 = normal, 1.8 = peak jam
      vulnerablePopulationCount: { type: Number, default: 5000 },
    },
    assumptions: [String],
    simulationSteps: [simulationStepSchema],
    mitigationStrategy: {
      recommendedActionPlan: [String],
      preventedHarmScore: { type: Number, default: 72 }, // percentage of harm mitigatable
      contingencyNotes: String,
    },
    isDefaultTemplate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

simulationScenarioSchema.index({ center: "2dsphere" });

export default mongoose.model("SimulationScenario", simulationScenarioSchema);
