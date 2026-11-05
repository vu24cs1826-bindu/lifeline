import EmergencyIncident from "../models/EmergencyIncident.js";
import { notifyEligible, remindPending } from "./matchingService.js";
import { notifyAdmins } from "./notificationService.js";
import { addTimeline, broadcast, changeStatus } from "./incidentService.js";
import audit from "../utils/audit.js";

const MAX_LEVEL = 4;

// One pass: finds incidents nobody accepted in time, widens the search and tells coordinators
export async function escalationPass() {
  const minutes = Number(process.env.ESCALATION_MINUTES || 2);
  const maxRadius = Number(process.env.ESCALATION_MAX_RADIUS_KM || 100);

  const stale = await EmergencyIncident.find({
    status: { $in: ["PENDING", "ACKNOWLEDGED"] },
    assignedResponder: null,
    "escalation.level": { $lt: MAX_LEVEL },
    "escalation.lastAt": { $lte: new Date(Date.now() - minutes * 60 * 1000) },
  }).limit(20);

  for (const incident of stale) {
    const level = incident.escalation.level + 1;
    const radiusKm = Math.min(incident.escalation.radiusKm * 2, maxRadius);
    incident.escalation.level = level;
    incident.escalation.radiusKm = radiusKm;
    incident.escalation.lastAt = new Date();

    const reminded = await remindPending(incident);
    const fresh = await notifyEligible(incident, radiusKm);
    if (level >= 2) {
      await notifyAdmins({
        type: "ESCALATION",
        title: `Incident ${incident.incidentId} needs attention`,
        message: `No responder accepted after ${level} escalation(s). Please assign manually.`,
        data: { incidentId: incident._id },
      });
    }
    addTimeline(incident, "ESCALATED", `Escalation level ${level}: radius ${radiusKm} km, ${reminded} reminded, ${fresh} newly notified`, null, { level, radiusKm, reminded, fresh });
    await incident.save();
    if (fresh > 0 && incident.status === "PENDING") await changeStatus(incident, "ACKNOWLEDGED", null, `${fresh} responders notified after escalation`);
    else await broadcast(incident);
    await audit(null, "INCIDENT_ESCALATED", "EmergencyIncident", incident._id, { level, radiusKm, reminded, fresh });
  }
  return stale.length;
}

export function startEscalationWorker() {
  const timer = setInterval(() => escalationPass().catch((e) => console.error("Escalation error:", e.message)), 30 * 1000);
  timer.unref();
  return timer;
}
