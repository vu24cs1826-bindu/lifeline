import EmergencyIncident, { TRANSITIONS } from "../models/EmergencyIncident.js";
import ResponderAssignment from "../models/ResponderAssignment.js";
import ResponderProfile from "../models/ResponderProfile.js";
import ApiError from "../utils/ApiError.js";
import audit from "../utils/audit.js";
import { notify } from "./notificationService.js";
import { aiClassify } from "./aiService.js";
import { emitToUser, emitToRole, emitToIncident } from "../sockets/io.js";

export function addTimeline(incident, type, message, by, meta) {
  incident.timeline.push({ type, message, by: by?._id || by || undefined, meta });
}

// Tells everyone involved that something changed, so dashboards refresh
export async function broadcast(incident, event = "incident:updated") {
  const payload = { id: incident._id, incidentId: incident.incidentId, status: incident.status };
  emitToUser(incident.reporter?._id || incident.reporter, event, payload);
  if (incident.assignedResponder) emitToUser(incident.assignedResponder?._id || incident.assignedResponder, event, payload);
  emitToRole("admin", event, payload);
  emitToIncident(incident._id, event, payload);
}

const STAMPS = {
  ACKNOWLEDGED: "acknowledgedAt", IN_PROGRESS: "startedAt", RESOLVED: "resolvedAt", CLOSED: "closedAt", CANCELLED: "cancelledAt",
};

// The only place where a status changes. It checks the allowed workflow.
export async function changeStatus(incident, next, actor, note) {
  if (!(TRANSITIONS[incident.status] || []).includes(next)) {
    throw new ApiError(409, `Cannot change status from ${incident.status} to ${next}.`);
  }
  const prev = incident.status;
  incident.status = next;
  const stamp = STAMPS[next];
  if (stamp && !incident[stamp]) incident[stamp] = new Date();
  if (next === "RESOLVED" && note) incident.resolution = note;
  addTimeline(incident, `STATUS_${next}`, note || `Status changed from ${prev} to ${next}`, actor, { from: prev, to: next });
  await incident.save();

  await audit(actor, "INCIDENT_STATUS_CHANGED", "EmergencyIncident", incident._id, { from: prev, to: next, note });

  if (next === "RESOLVED" || next === "CLOSED") {
    await ResponderAssignment.updateMany({ incident: incident._id, status: "accepted" }, { status: "completed" });
    if (next === "RESOLVED" && incident.assignedResponder) {
      await ResponderProfile.updateOne({ user: incident.assignedResponder }, { $inc: { completedCount: 1 } });
    }
  }
  if (actor && String(actor._id) !== String(incident.reporter?._id || incident.reporter)) {
    await notify(incident.reporter?._id || incident.reporter, {
      type: "INCIDENT_STATUS",
      title: `Incident ${incident.incidentId}: ${next.replace(/_/g, " ").toLowerCase()}`,
      message: note || "Your incident status was updated.",
      data: { incidentId: incident._id },
    });
  }
  await broadcast(incident);
  return incident;
}

// Runs in the background after the SOS reply is sent, so the citizen never waits for the AI
export async function runAIClassification(incidentId) {
  const incident = await EmergencyIncident.findById(incidentId);
  if (!incident) return;
  const result = await aiClassify(incident.description, incident.category);
  if (!result) return; // keep the fallback result
  incident.ai = { ...incident.toObject().ai, ...result, source: "ai" };
  if (result.urgent && incident.priority !== "critical") incident.priority = "high";
  addTimeline(incident, "AI_SUGGESTION", "AI classification suggested (a suggestion only, not a diagnosis)", null, result);
  await incident.save();
  await broadcast(incident);
}
