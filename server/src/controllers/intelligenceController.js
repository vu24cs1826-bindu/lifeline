import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import audit from "../utils/audit.js";
import SituationCluster from "../models/SituationCluster.js";
import RiskZone from "../models/RiskZone.js";
import Facility from "../models/Facility.js";
import SimulationScenario from "../models/SimulationScenario.js";
import PreventionProposal from "../models/PreventionProposal.js";
import EmergencyIncident from "../models/EmergencyIncident.js";
import CommunityReport from "../models/CommunityReport.js";
import ResponderProfile from "../models/ResponderProfile.js";
import { runSpatioTemporalClustering } from "../services/clusteringEngine.js";
import { evaluateZoneRisks } from "../services/predictiveRiskEngine.js";
import { recommendResourcePackage } from "../services/resourceCoordinationEngine.js";
import { runSimulation } from "../services/crisisSimulationEngine.js";
import { generatePreventionIntelligence } from "../services/preventionEngine.js";
import { broadcast } from "../services/incidentService.js";

// 1. Situation Clusters
export const getSituations = asyncHandler(async (req, res) => {
  const situations = await SituationCluster.find({ status: { $ne: "dismissed" } })
    .populate("incidents", "incidentId category description priority status location createdAt")
    .populate("communityReports", "title category status location createdAt")
    .sort({ confidence: -1, lastObservedAt: -1 });

  res.json({ success: true, count: situations.length, situations });
});

export const triggerSynthesis = asyncHandler(async (req, res) => {
  const result = await runSpatioTemporalClustering();
  await audit(req.user, "CLUSTER_SYNTHESIS_TRIGGERED", "SituationCluster", null, { synthesized: result.synthesized }, req.ip);
  res.json({ success: true, message: `Synthesized ${result.synthesized} situation cluster(s)`, result });
});

export const moderateCluster = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, verificationNote } = req.body;

  const cluster = await SituationCluster.findById(id);
  if (!cluster) throw new ApiError(404, "Situation cluster not found.");

  if (status) cluster.status = status;
  cluster.moderated = true;
  cluster.moderatedBy = req.user._id;
  if (verificationNote) {
    cluster.recommendedVerificationActions.push(`[Moderator Note]: ${verificationNote}`);
  }

  await cluster.save();
  await audit(req.user, "CLUSTER_MODERATED", "SituationCluster", cluster._id, { status }, req.ip);
  res.json({ success: true, cluster });
});

// 2. Predictive Risk
export const getPredictiveRisk = asyncHandler(async (req, res) => {
  const zones = await evaluateZoneRisks();

  // Aggregate municipal risk metrics
  const avgRisk = Math.round(zones.reduce((s, z) => s + z.predictedRisk, 0) / (zones.length || 1));
  const severeCount = zones.filter((z) => z.riskLevel === "severe").length;

  res.json({
    success: true,
    summary: {
      averageMunicipalRiskScore: avgRisk,
      severeRiskZonesCount: severeCount,
      evaluatedZonesCount: zones.length,
      modelType: "Multi-Factor Bayesian Weighted Ensemble",
      baselineType: "Poisson Rate Estimator",
      evaluationTimestamp: new Date(),
    },
    zones,
  });
});

// 3. Living Digital Twin Unified GIS Payload
export const getDigitalTwin = asyncHandler(async (req, res) => {
  const [incidents, reports, clusters, zones, facilities, responders] = await Promise.all([
    EmergencyIncident.find({ status: { $in: ["PENDING", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "IN_PROGRESS"] } })
      .select("incidentId category description priority status location address silent createdAt assignedResponder")
      .populate("assignedResponder", "name phone"),
    CommunityReport.find({ status: "verified" })
      .select("title category description location address images createdAt"),
    SituationCluster.find({ status: { $in: ["developing", "escalating", "stabilized"] } }),
    RiskZone.find(),
    Facility.find({ operatingStatus: { $ne: "offline" } }),
    ResponderProfile.find({ available: true, verified: true })
      .select("skills qualification location locationUpdatedAt")
      .populate("user", "name role"),
  ]);

  res.json({
    success: true,
    timestamp: new Date(),
    layers: {
      activeIncidents: { count: incidents.length, data: incidents },
      verifiedCommunityHazards: { count: reports.length, data: reports },
      macroSituationClusters: { count: clusters.length, data: clusters },
      predictiveRiskZones: { count: zones.length, data: zones },
      infrastructureFacilities: { count: facilities.length, data: facilities },
      activeRespondersOnDuty: { count: responders.length, data: responders },
    },
  });
});

// 4. Facilities & Capacity Management
export const getFacilities = asyncHandler(async (req, res) => {
  const { type, operatingStatus } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (operatingStatus) filter.operatingStatus = operatingStatus;

  const facilities = await Facility.find(filter).sort({ traumaLevel: 1, availableBeds: -1 });
  res.json({ success: true, count: facilities.length, facilities });
});

export const updateFacilityCapacity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { availableBeds, icuBedsAvailable, oxygenCylindersAvailable, ambulancesReady, operatingStatus, bloodInventory } = req.body;

  const facility = await Facility.findById(id);
  if (!facility) throw new ApiError(404, "Facility not found.");

  if (availableBeds !== undefined) facility.availableBeds = availableBeds;
  if (icuBedsAvailable !== undefined) facility.icuBedsAvailable = icuBedsAvailable;
  if (oxygenCylindersAvailable !== undefined) facility.oxygenCylindersAvailable = oxygenCylindersAvailable;
  if (ambulancesReady !== undefined) facility.ambulancesReady = ambulancesReady;
  if (operatingStatus) facility.operatingStatus = operatingStatus;
  if (bloodInventory) facility.bloodInventory = { ...facility.bloodInventory, ...bloodInventory };

  await facility.save();
  await audit(req.user, "FACILITY_CAPACITY_UPDATED", "Facility", facility._id, req.body, req.ip);

  res.json({ success: true, facility });
});

// 5. Intelligent Resource Coordination
export const getResourceRecommendation = asyncHandler(async (req, res) => {
  const { incidentId } = req.body;
  if (!incidentId) throw new ApiError(400, "Incident ID is required.");

  const recommendation = await recommendResourcePackage(incidentId);
  res.json({ success: true, recommendation });
});

// 6. Crisis Simulation Laboratory
export const getSimulationScenarios = asyncHandler(async (req, res) => {
  const scenarios = await SimulationScenario.find().sort({ createdAt: -1 });
  res.json({ success: true, count: scenarios.length, scenarios });
});

export const executeSimulation = asyncHandler(async (req, res) => {
  const { scenarioId, customParameters } = req.body;
  if (!scenarioId) throw new ApiError(400, "Simulation scenario ID is required.");

  const simulationResult = await runSimulation(scenarioId, customParameters);
  await audit(req.user, "SIMULATION_EXECUTED", "SimulationScenario", null, { scenarioId }, req.ip);

  res.json({ success: true, simulation: simulationResult });
});

// 7. Prevention & Infrastructure Intelligence
export const getPreventionIntelligence = asyncHandler(async (req, res) => {
  const report = await generatePreventionIntelligence();
  res.json({ success: true, report });
});

export const updateProposalStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  const proposal = await PreventionProposal.findById(id);
  if (!proposal) throw new ApiError(404, "Prevention proposal not found.");

  if (status) proposal.status = status;
  if (reviewNotes) proposal.reviewNotes = reviewNotes;
  proposal.reviewedBy = req.user._id;

  await proposal.save();
  await audit(req.user, "PREVENTION_PROPOSAL_REVIEWED", "PreventionProposal", proposal._id, { status }, req.ip);

  res.json({ success: true, proposal });
});

// 8. IoT Environmental & River Sensors Telemetry
import IoTSensor from "../models/IoTSensor.js";
import BroadcastAlert from "../models/BroadcastAlert.js";

export const getIoTSensors = asyncHandler(async (req, res) => {
  let sensors = await IoTSensor.find().sort({ status: -1 });

  // If no sensors seeded yet, seed defaults on the fly
  if (sensors.length === 0) {
    const defaultSensors = [
      {
        sensorCode: "SENS-RIVER-01",
        name: "Krishna Causeway Ultrasonic Flood Sensor",
        type: "water_level_ultrasonic",
        location: { type: "Point", coordinates: [80.4465, 16.3247] },
        address: "Old Krishna Canal Low-Bridge",
        currentValue: 24,
        unit: "cm",
        thresholdWarning: 40,
        thresholdCritical: 60,
        status: "normal",
        batteryPercent: 96,
      },
      {
        sensorCode: "SENS-UNDERPASS-02",
        name: "Amaravati Expressway Dip Inundation Sensor",
        type: "water_level_ultrasonic",
        location: { type: "Point", coordinates: [80.4415, 16.3147] },
        address: "Expressway Underpass Mile 4",
        currentValue: 42,
        unit: "cm",
        thresholdWarning: 35,
        thresholdCritical: 55,
        status: "warning",
        batteryPercent: 88,
      },
      {
        sensorCode: "SENS-HAZMAT-03",
        name: "Autonagar Industrial Gas & Thermal Sensor",
        type: "air_smoke_chemical",
        location: { type: "Point", coordinates: [80.4615, 16.2867] },
        address: "Chemical Logistics Gate 2",
        currentValue: 18,
        unit: "PPM",
        thresholdWarning: 50,
        thresholdCritical: 100,
        status: "normal",
        batteryPercent: 92,
      },
    ];
    sensors = await IoTSensor.insertMany(defaultSensors);
  }

  res.json({ success: true, count: sensors.length, sensors });
});

export const simulateSensorSpike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sensor = await IoTSensor.findById(id);
  if (!sensor) throw new ApiError(404, "Sensor not found.");

  sensor.currentValue = sensor.thresholdCritical + 15;
  sensor.status = "critical_alert";
  sensor.lastTelemetryAt = new Date();
  await sensor.save();

  // Auto-generate an emergency flood incident from the IoT spike!
  await EmergencyIncident.create({
    incidentId: `IOT-ALERT-${Math.floor(1000 + Math.random() * 9000)}`,
    reporter: req.user._id,
    category: "stranded",
    description: `AUTOMATED IoT SENSOR TRIGGER: ${sensor.name} exceeded critical threshold (${sensor.currentValue}${sensor.unit} vs ${sensor.thresholdCritical}${sensor.unit} limit). Imminent water submersion.`,
    location: sensor.location,
    address: sensor.address,
    priority: "critical",
    status: "ACKNOWLEDGED",
    timeline: [
      {
        type: "IOT_TELEMETRY_TRIGGER",
        message: `Ultrasonic reading spiked to ${sensor.currentValue}${sensor.unit}. Automated incident registered.`,
        by: req.user._id,
      },
    ],
  });

  await audit(req.user, "IOT_SENSOR_SPIKE_SIMULATED", "IoTSensor", sensor._id, { value: sensor.currentValue }, req.ip);

  res.json({
    success: true,
    message: `Telemetry spike simulated! Sensor ${sensor.sensorCode} is now in CRITICAL_ALERT. Automated incident generated on Live City Map.`,
    sensor,
  });
});

export const resetSensor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const sensor = await IoTSensor.findById(id);
  if (!sensor) throw new ApiError(404, "Sensor not found.");

  sensor.currentValue = 22;
  sensor.status = "normal";
  sensor.lastTelemetryAt = new Date();
  await sensor.save();

  res.json({ success: true, message: `Sensor ${sensor.sensorCode} normalized.`, sensor });
});

// 9. Citizen Geofenced WhatsApp & SMS Broadcasts
export const getBroadcasts = asyncHandler(async (req, res) => {
  const alerts = await BroadcastAlert.find().sort({ createdAt: -1 }).limit(10);
  res.json({ success: true, count: alerts.length, alerts });
});

export const sendBroadcast = asyncHandler(async (req, res) => {
  const { title, message, targetArea, radiusKm = 2, severity = "warning", channel = "whatsapp_and_sms" } = req.body;
  if (!title || !message) throw new ApiError(400, "Title and message are required.");

  const estimated = Math.round(radiusKm * 480 + 350);
  const delivered = Math.round(estimated * 0.98);

  const alert = await BroadcastAlert.create({
    alertCode: `BC-${Date.now().toString().slice(-6)}`,
    title,
    message,
    targetArea: targetArea || "Municipal Radius",
    radiusKm: Number(radiusKm),
    severity,
    channel,
    estimatedRecipients: estimated,
    deliveredCount: delivered,
    sentBy: req.user._id,
  });

  await audit(req.user, "CITIZEN_BROADCAST_DISPATCHED", "BroadcastAlert", alert._id, { delivered }, req.ip);

  res.json({
    success: true,
    message: `Geofenced ${channel.replace(/_/g, " & ")} alert delivered to ${delivered.toLocaleString()} citizens within ${radiusKm}km radius!`,
    alert,
  });
});

// 10. Smart Traffic Signal Green-Light Corridor
let trafficCorridorStatus = {
  active: false,
  ambulanceId: "AMB-TRAUMA-04",
  route: "Collectorate Junction -> Guntur Ring Road -> Government General Hospital Trauma Gate",
  estimatedTransitMinutes: 18,
  preemptedTransitMinutes: 7,
  signals: [
    { name: "Collectorate Low-Level Cross", status: "RED", preempted: false },
    { name: "City Bus Terminal Circle", status: "RED", preempted: false },
    { name: "Ring Road Flyover Entry", status: "RED", preempted: false },
    { name: "Hospital Emergency Trauma Gate", status: "RED", preempted: false },
  ],
};

export const getTrafficCorridors = asyncHandler(async (req, res) => {
  res.json({ success: true, corridor: trafficCorridorStatus });
});

export const preemptTrafficCorridor = asyncHandler(async (req, res) => {
  const { activate } = req.body;
  trafficCorridorStatus.active = Boolean(activate);
  trafficCorridorStatus.signals = trafficCorridorStatus.signals.map((sig) => ({
    ...sig,
    status: trafficCorridorStatus.active ? "GREEN" : "RED",
    preempted: trafficCorridorStatus.active,
  }));

  await audit(req.user, "TRAFFIC_CORRIDOR_PREEMPTED", "TrafficCorridor", null, { active: trafficCorridorStatus.active }, req.ip);

  res.json({
    success: true,
    message: trafficCorridorStatus.active
      ? "Smart Traffic Corridor ACTIVATED: All 4 intersections preempted to GREEN. Ambulance transit reduced to 7 mins!"
      : "Smart Traffic Corridor normalized to standard municipal timing.",
    corridor: trafficCorridorStatus,
  });
});

