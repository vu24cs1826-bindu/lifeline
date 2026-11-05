import mongoose from "mongoose";

const preventionProposalSchema = new mongoose.Schema(
  {
    proposalCode: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["traffic_redesign", "stormwater_drainage", "fire_hydrant_network", "hazardous_curve_mitigation", "public_lighting_corridor", "structural_reinforcement"],
      required: true,
      index: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    priorityScore: { type: Number, min: 1, max: 100, default: 75, index: true },
    recurringIncidentCount: { type: Number, default: 0 },
    evidenceSummary: { type: String, required: true },
    contributingFactors: [String],
    proposedEngineeringAction: { type: String, required: true },
    estimatedCostTier: {
      type: String,
      enum: ["low_under_1L", "medium_1L_to_10L", "high_10L_to_50L", "capital_civic_above_50L"],
      default: "medium_1L_to_10L",
    },
    estimatedHarmReductionPercentage: { type: Number, default: 65 },
    status: {
      type: String,
      enum: ["proposed", "under_civic_review", "budget_approved", "in_execution", "completed"],
      default: "proposed",
      index: true,
    },
    reviewNotes: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

preventionProposalSchema.index({ location: "2dsphere" });

export default mongoose.model("PreventionProposal", preventionProposalSchema);
