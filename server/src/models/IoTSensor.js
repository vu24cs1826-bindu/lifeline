import mongoose from "mongoose";

const iotSensorSchema = new mongoose.Schema(
  {
    sensorCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["water_level_ultrasonic", "road_friction_ice_water", "air_smoke_chemical", "structural_vibration"],
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    address: { type: String, required: true },
    currentValue: { type: Number, required: true },
    unit: { type: String, default: "cm" },
    thresholdWarning: { type: Number, required: true },
    thresholdCritical: { type: Number, required: true },
    status: {
      type: String,
      enum: ["normal", "warning", "critical_alert", "offline"],
      default: "normal",
      index: true,
    },
    batteryPercent: { type: Number, default: 94 },
    lastTelemetryAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

iotSensorSchema.index({ location: "2dsphere" });

export default mongoose.model("IoTSensor", iotSensorSchema);
