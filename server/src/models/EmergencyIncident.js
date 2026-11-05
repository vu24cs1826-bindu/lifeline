import mongoose from "mongoose";

const { Schema } = mongoose;

export const CATEGORIES = [
  "road_accident", "medical", "fire", "personal_safety", "blood_requirement", "stranded", "community_safety", "other",
];
export const STATUSES = [
  "PENDING", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED", "REJECTED",
];
export const OPEN_STATUSES = ["PENDING", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "IN_PROGRESS"];

export const TRANSITIONS = {
  PENDING: ["ACKNOWLEDGED", "REJECTED", "CANCELLED"],
  ACKNOWLEDGED: ["RESPONDER_ASSIGNED", "REJECTED", "CANCELLED"],
  RESPONDER_ASSIGNED: ["IN_PROGRESS", "ACKNOWLEDGED", "CANCELLED"],
  IN_PROGRESS: ["RESOLVED", "CANCELLED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  CANCELLED: [],
  REJECTED: [],
};

const timelineSchema = new Schema(
  {
    type: { type: String, required: true },
    message: String,
    by: { type: Schema.Types.ObjectId, ref: "User" },
    meta: Schema.Types.Mixed,
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const incidentSchema = new Schema(
  {
    incidentId: { type: String, required: true, unique: true },
    reporter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, enum: CATEGORIES, default: "other", index: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    address: { type: String, trim: true, maxlength: 200 },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    status: { type: String, enum: STATUSES, default: "PENDING", index: true },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    silent: { type: Boolean, default: false },
    // The citizen must tick this to let responders see live location
    shareLocation: { type: Boolean, default: false },
    liveLocation: { coordinates: [Number], at: Date },
    ai: {
      suggestedCategory: String,
      summary: String,
      missingDetails: [String],
      suggestedResponder: String,
      urgent: { type: Boolean, default: false },
      needsHumanReview: { type: Boolean, default: false },
      source: { type: String, enum: ["ai", "fallback"], default: "fallback" },
      correctedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    assignedResponder: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    possibleDuplicateOf: { type: Schema.Types.ObjectId, ref: "EmergencyIncident" },
    escalation: {
      level: { type: Number, default: 0 },
      radiusKm: { type: Number, default: 10 },
      lastAt: Date,
    },
    acknowledgedAt: Date,
    assignedAt: Date,
    startedAt: Date,
    resolvedAt: Date,
    closedAt: Date,
    cancelledAt: Date,
    resolution: String,
    timeline: [timelineSchema],
  },
  { timestamps: true }
);
incidentSchema.index({ location: "2dsphere" });
incidentSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("EmergencyIncident", incidentSchema);
