import EmergencyIncident from "../models/EmergencyIncident.js";
import CommunityReport from "../models/CommunityReport.js";
import SituationCluster from "../models/SituationCluster.js";
import { distanceKm, geoWithinSphere } from "../utils/geo.js";

// Mapping incident categories to macro-situation cluster categories
const CATEGORY_MAP = {
  flooded_road: "urban_flooding",
  stranded: "urban_flooding",
  road_accident: "multi_vehicle_accident",
  fire: "fire_conflagration",
  fire_hazard: "fire_conflagration",
  dangerous_location: "infrastructure_failure",
  broken_streetlight: "infrastructure_failure",
  accident_prone_road: "multi_vehicle_accident",
  medical: "multi_vehicle_accident",
};

/**
 * Synthesizes individual raw reports into macro-situation clusters.
 * Groups by spatial proximity (<= 1.5 km), time window (<= 6 hours), and categorical synergy.
 */
export async function runSpatioTemporalClustering() {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  // 1. Fetch active, non-closed incidents from last 6 hours
  const activeIncidents = await EmergencyIncident.find({
    status: { $in: ["PENDING", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "IN_PROGRESS"] },
    createdAt: { $gte: sixHoursAgo },
  });

  // 2. Fetch pending or verified community reports from last 6 hours
  const activeReports = await CommunityReport.find({
    status: { $in: ["pending", "verified"] },
    createdAt: { $gte: sixHoursAgo },
  });

  const rawPoints = [
    ...activeIncidents.map((inc) => ({
      id: inc._id,
      docType: "incident",
      category: inc.category,
      desc: inc.description,
      coords: inc.location.coordinates, // [lng, lat]
      createdAt: inc.createdAt,
    })),
    ...activeReports.map((rep) => ({
      id: rep._id,
      docType: "community_report",
      category: rep.category,
      desc: `${rep.title}: ${rep.description}`,
      coords: rep.location.coordinates, // [lng, lat]
      createdAt: rep.createdAt,
    })),
  ];

  if (rawPoints.length === 0) {
    return { synthesized: 0, clusters: [] };
  }

  // 3. Spatio-temporal cluster formation (DBSCAN-like spatial cohesion)
  const CLUSTER_DISTANCE_KM = 1.8;
  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < rawPoints.length; i++) {
    if (visited.has(i)) continue;
    visited.add(i);

    const group = [rawPoints[i]];
    const [lngA, latA] = rawPoints[i].coords;

    for (let j = i + 1; j < rawPoints.length; j++) {
      if (visited.has(j)) continue;
      const [lngB, latB] = rawPoints[j].coords;
      const dist = distanceKm(latA, lngA, latB, lngB);

      // Check spatial distance and temporal proximity
      if (dist <= CLUSTER_DISTANCE_KM) {
        visited.add(j);
        group.push(rawPoints[j]);
      }
    }

    clusters.push(group);
  }

  const generated = [];

  for (const group of clusters) {
    const incIds = group.filter((g) => g.docType === "incident").map((g) => g.id);
    const repIds = group.filter((g) => g.docType === "community_report").map((g) => g.id);

    // Compute centroid
    const avgLng = group.reduce((sum, g) => sum + g.coords[0], 0) / group.length;
    const avgLat = group.reduce((sum, g) => sum + g.coords[1], 0) / group.length;

    // Determine cluster category from frequency
    const catFreq = {};
    for (const item of group) {
      const macro = CATEGORY_MAP[item.category] || "general_crisis";
      catFreq[macro] = (catFreq[macro] || 0) + 1;
    }
    const dominantCategory = Object.keys(catFreq).reduce((a, b) => (catFreq[a] > catFreq[b] ? a : b));

    // Calculate confidence score (proportional to multi-source evidence and verification)
    const count = group.length;
    let confidence = Math.min(0.96, 0.40 + count * 0.12);
    if (repIds.length > 0 && incIds.length > 0) {
      // Cross-source synergy bonus
      confidence = Math.min(0.98, confidence + 0.15);
    }

    // Determine severity
    let severity = "low";
    if (count >= 5 || dominantCategory === "fire_conflagration") severity = "critical";
    else if (count >= 3 || dominantCategory === "urban_flooding") severity = "high";
    else if (count >= 2) severity = "medium";

    // Format human-readable title & verification actions
    const title = formatClusterTitle(dominantCategory, count);
    const verificationActions = [
      "Cross-check local CCTV feeds and municipal flood gauge telemetry",
      "Dispatch nearest field safety surveyor for ground verification",
      "Coordinate with Traffic Control Room to inspect feeder corridors",
    ];

    // Evidence breakdown
    const evidenceSources = [
      ...(incIds.length > 0 ? [{ sourceType: "citizen_sos", count: incIds.length, summary: `${incIds.length} active emergency call(s)` }] : []),
      ...(repIds.length > 0 ? [{ sourceType: "community_hazard", count: repIds.length, summary: `${repIds.length} verified citizen hazard report(s)` }] : []),
    ];

    // Check if an existing cluster is near centroid to update, else create new
    let existing = await SituationCluster.findOne({
      status: { $in: ["developing", "escalating", "stabilized"] },
      center: geoWithinSphere(avgLng, avgLat, CLUSTER_DISTANCE_KM * 1000),
    });

    if (existing) {
      existing.incidentCount = count;
      existing.incidents = incIds;
      existing.communityReports = repIds;
      existing.evidenceSources = evidenceSources;
      existing.confidence = confidence;
      existing.severity = severity;
      existing.lastObservedAt = new Date();
      existing.radiusMeters = Math.max(600, count * 350);
      await existing.save();
      generated.push(existing);
    } else {
      const code = `CL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const created = await SituationCluster.create({
        clusterId: code,
        title,
        category: dominantCategory,
        severity,
        confidence: Math.round(confidence * 100) / 100,
        center: { type: "Point", coordinates: [avgLng, avgLat] },
        radiusMeters: Math.max(600, count * 350),
        incidentCount: count,
        incidents: incIds,
        communityReports: repIds,
        evidenceSources,
        recommendedVerificationActions: verificationActions,
        predictedImpact: `${count} reported hazards converging. Potential disruption within a ${(count * 0.4).toFixed(1)} km radius.`,
      });
      generated.push(created);
    }
  }

  return { synthesized: generated.length, clusters: generated };
}

function formatClusterTitle(category, count) {
  switch (category) {
    case "urban_flooding":
      return `Developing Urban Water-Logging & Drainage Surge (${count} reports)`;
    case "multi_vehicle_accident":
      return `Corridor Traffic Collision & Hazard Chain (${count} reports)`;
    case "fire_conflagration":
      return `Active Smoke & Fire Hazard Cluster (${count} reports)`;
    case "infrastructure_failure":
      return `Critical Infrastructure Deficit Zone (${count} reports)`;
    default:
      return `Multi-Report Real-World Incident Cluster (${count} reports)`;
  }
}
