import ResponderProfile from "../models/ResponderProfile.js";
import ResponderAssignment from "../models/ResponderAssignment.js";
import EmergencyIncident from "../models/EmergencyIncident.js";
import { distanceKm } from "../utils/geo.js";
import { notify } from "./notificationService.js";
import { emitToUser } from "../sockets/io.js";

const CATEGORY_LABEL = {
  road_accident: "Road accident", medical: "Medical emergency", fire: "Fire incident", personal_safety: "Personal safety",
  blood_requirement: "Blood requirement", stranded: "Stranded person", community_safety: "Community safety", other: "Emergency",
};
export const categoryLabel = (c) => CATEGORY_LABEL[c] || "Emergency";

const SKILL_WANTED = {
  medical: ["first_aid", "cpr", "ambulance"],
  road_accident: ["first_aid", "ambulance", "rescue", "driving"],
  fire: ["firefighting", "rescue"],
  personal_safety: ["counselling", "rescue"],
  stranded: ["driving", "rescue"],
  blood_requirement: ["blood_donation_support"],
};

// Is this responder allowed to get this kind of incident?
function isEligible(profile, user, category) {
  if (!user || user.isSuspended || user.verificationStatus !== "verified") return false;
  if (category === "medical") {
    // Medical emergencies go to medical responders, organizations, or volunteers with first-aid skills
    return user.role === "medical_responder" || user.role === "organization" || profile.skills.some((s) => ["first_aid", "cpr", "ambulance"].includes(s));
  }
  return true;
}

function score(profile, user, category, dist, radiusKm) {
  let s = 100 - Math.min(dist / radiusKm, 1) * 50; // closer is better
  const wanted = SKILL_WANTED[category] || [];
  s += profile.skills.filter((k) => wanted.includes(k)).length * 10;
  if (category === "medical" && user.role === "medical_responder") s += 30;
  if (profile.organization) s += 5;
  return Math.round(s);
}

// Returns eligible responders near the incident, best first
export async function findEligible(incident, radiusKm) {
  const profiles = await ResponderProfile.find({
    available: true,
    verified: true,
    location: { $nearSphere: { $geometry: incident.location, $maxDistance: radiusKm * 1000 } },
  })
    .populate("user", "name role verificationStatus isSuspended")
    .limit(50);

  return profiles
    .filter((p) => isEligible(p, p.user, incident.category))
    .map((p) => {
      const dist = distanceKm(incident.location.coordinates, p.location.coordinates);
      return { profile: p, user: p.user, distanceKm: dist, score: score(p, p.user, incident.category, dist, radiusKm) };
    })
    .sort((a, b) => b.score - a.score);
}

// Notifies eligible responders who have not been notified yet. Returns how many were newly notified.
export async function notifyEligible(incident, radiusKm = incident.escalation?.radiusKm || 10) {
  const candidates = await findEligible(incident, radiusKm);
  let count = 0;
  for (const c of candidates) {
    const exists = await ResponderAssignment.findOne({ incident: incident._id, responder: c.user._id });
    if (exists) continue;
    await ResponderAssignment.create({ incident: incident._id, responder: c.user._id, distanceKm: c.distanceKm, score: c.score });
    await notify(c.user._id, {
      type: "INCIDENT_REQUEST",
      title: `${categoryLabel(incident.category)} nearby`,
      message: `About ${c.distanceKm} km away. Open your dashboard to accept or decline.`,
      data: { incidentId: incident._id },
    });
    emitToUser(c.user._id, "incident:new", { id: incident._id });
    count++;
  }
  return count;
}

// Re-sends a reminder to responders who were notified but have not answered
export async function remindPending(incident) {
  const pending = await ResponderAssignment.find({ incident: incident._id, status: "notified" });
  for (const a of pending) {
    await notify(a.responder, {
      type: "INCIDENT_REMINDER",
      title: "Request still waiting",
      message: `${categoryLabel(incident.category)} still needs a responder.`,
      data: { incidentId: incident._id },
    });
    emitToUser(a.responder, "incident:new", { id: incident._id });
  }
  return pending.length;
}

export async function expireOthers(incidentId, exceptUserId) {
  const others = await ResponderAssignment.find({ incident: incidentId, responder: { $ne: exceptUserId }, status: "notified" });
  await ResponderAssignment.updateMany({ _id: { $in: others.map((o) => o._id) } }, { status: "expired" });
  others.forEach((o) => emitToUser(o.responder, "incident:taken", { id: incidentId }));
}

export async function findPossibleDuplicate(location, category) {
  return EmergencyIncident.findOne({
    category,
    status: { $in: ["PENDING", "ACKNOWLEDGED", "RESPONDER_ASSIGNED", "IN_PROGRESS"] },
    createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    location: { $nearSphere: { $geometry: location, $maxDistance: 200 } },
  }).select("_id");
}
