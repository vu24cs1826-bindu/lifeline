import EmergencyIncident, { CATEGORIES, OPEN_STATUSES } from "../models/EmergencyIncident.js";
import ResponderAssignment from "../models/ResponderAssignment.js";
import ResponderProfile from "../models/ResponderProfile.js";
import EmergencyContact from "../models/EmergencyContact.js";
import IncidentMessage from "../models/IncidentMessage.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import audit from "../utils/audit.js";
import generateIncidentId from "../utils/incidentId.js";
import { point, validCoords } from "../utils/geo.js";
import { fallbackClassify } from "../services/aiService.js";
import { notifyEligible, findEligible, expireOthers, findPossibleDuplicate, categoryLabel } from "../services/matchingService.js";
import { addTimeline, broadcast, changeStatus, runAIClassification } from "../services/incidentService.js";
import { serializeIncident } from "../services/incidentSerializer.js";
import { notify, notifyAdmins } from "../services/notificationService.js";
import { emitToUser, emitToIncident } from "../sockets/io.js";

export const OFFICIAL_NOTICE =
  "LifeLine alerts registered community responders only. Official emergency services have NOT been contacted. In danger, call 112 (India national emergency number) or 108 (ambulance) now.";

const populateFull = [
  { path: "reporter", select: "name phone" },
  { path: "assignedResponder", select: "name" },
];

async function loadIncident(id) {
  const inc = await EmergencyIncident.findById(id).populate(populateFull);
  if (!inc) throw new ApiError(404, "Incident not found.");
  return inc;
}

// Who may open this incident at all?
async function assertCanView(incident, user) {
  if (user.role === "admin") return;
  if (String(incident.reporter._id || incident.reporter) === String(user._id)) return;
  if (incident.assignedResponder && String(incident.assignedResponder._id) === String(user._id)) return;
  const asg = await ResponderAssignment.exists({ incident: incident._id, responder: user._id, status: { $in: ["notified", "accepted", "completed"] } });
  if (!asg) throw new ApiError(403, "You do not have access to this incident.");
}

// ---------- Citizen ----------
export const createIncident = asyncHandler(async (req, res) => {
  const { category = "other", lat, lng, address, shareLocation = false, silent = false, confirmed } = req.body;
  let { description } = req.body;

  // Safeguard against accidental SOS: the app must send the confirmation flag
  if (confirmed !== true) throw new ApiError(400, "Please confirm the emergency before sending.");
  if (!validCoords(lat, lng)) throw new ApiError(400, "A valid location is required.");
  if (!description?.trim()) {
    if (!silent) throw new ApiError(400, "Please describe the emergency.");
    description = "Silent SOS activated. The person may be unable to speak or type.";
  }

  const fallback = fallbackClassify(description, category);
  const location = point(lat, lng);
  const dup = await findPossibleDuplicate(location, category);

  const incident = await EmergencyIncident.create({
    incidentId: generateIncidentId(),
    reporter: req.user._id,
    category, description, address, location, shareLocation, silent,
    priority: silent || fallback.urgent ? "high" : "medium",
    ai: fallback,
    possibleDuplicateOf: dup?._id,
    escalation: { level: 0, radiusKm: Number(process.env.DEFAULT_RADIUS_KM || 10), lastAt: new Date() },
    timeline: [
      { type: "REPORT_CREATED", message: silent ? "Silent SOS reported" : "Emergency reported", by: req.user._id },
      { type: "AI_SUGGESTION", message: "Automatic suggestion (keyword based). A suggestion only, not a diagnosis.", meta: fallback },
    ],
  });

  const notified = await notifyEligible(incident);
  if (notified > 0) {
    await changeStatus(incident, "ACKNOWLEDGED", null, `Alert sent to ${notified} eligible responder(s)`);
  }
  await audit(req.user, "INCIDENT_CREATED", "EmergencyIncident", incident._id, { category, silent }, req.ip);
  await notifyAdmins({
    type: "INCIDENT_NEW", title: `New ${categoryLabel(category)}`,
    message: `${incident.incidentId}${dup ? " (possible duplicate)" : ""}`, data: { incidentId: incident._id },
  });
  await broadcast(incident, "incident:new");
  runAIClassification(incident._id).catch((e) => console.error("AI task error:", e.message));

  // Silent SOS: give the app the trusted contacts so it can open SMS or call links on the phone
  let trustedContacts;
  if (silent) {
    trustedContacts = await EmergencyContact.find({ owner: req.user._id, isTrusted: true }).select("name phone");
    addTimeline(incident, "SILENT_CONTACTS", `${trustedContacts.length} trusted contact(s) prepared for the phone to alert`, req.user);
    await incident.save();
  }

  const fresh = await loadIncident(incident._id);
  res.status(201).json({
    success: true, notifiedCount: notified, notice: OFFICIAL_NOTICE,
    incident: serializeIncident(fresh, req.user), trustedContacts,
  });
});

export const listMine = asyncHandler(async (req, res) => {
  const list = await EmergencyIncident.find({ reporter: req.user._id }).populate(populateFull).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, incidents: list.map((i) => serializeIncident(i, req.user)) });
});

// ---------- Responder ----------
export const listAvailable = asyncHandler(async (req, res) => {
  const profile = await ResponderProfile.findOne({ user: req.user._id });
  const asgs = await ResponderAssignment.find({ responder: req.user._id, status: "notified" }).populate({ path: "incident", populate: populateFull });
  const incidents = asgs
    .filter((a) => a.incident && ["PENDING", "ACKNOWLEDGED"].includes(a.incident.status) && !a.incident.assignedResponder)
    .map((a) => serializeIncident(a.incident, req.user, { distanceKm: a.distanceKm, fromCoords: profile?.location?.coordinates }));
  res.json({ success: true, incidents });
});

export const listAssigned = asyncHandler(async (req, res) => {
  const list = await EmergencyIncident.find({ assignedResponder: req.user._id }).populate(populateFull).sort({ updatedAt: -1 }).limit(100);
  res.json({ success: true, incidents: list.map((i) => serializeIncident(i, req.user)) });
});

export const acceptIncident = asyncHandler(async (req, res) => {
  const asg = await ResponderAssignment.findOne({ incident: req.params.id, responder: req.user._id, status: "notified" });
  if (!asg) throw new ApiError(403, "This request was not sent to you, or you already answered it.");

  const busy = await EmergencyIncident.exists({ assignedResponder: req.user._id, status: { $in: ["RESPONDER_ASSIGNED", "IN_PROGRESS"] } });
  if (busy) throw new ApiError(409, "Finish your current incident before accepting another.");

  // One atomic update: only one responder can win
  const won = await EmergencyIncident.findOneAndUpdate(
    { _id: req.params.id, assignedResponder: null, status: { $in: ["PENDING", "ACKNOWLEDGED"] } },
    {
      $set: { assignedResponder: req.user._id, status: "RESPONDER_ASSIGNED", assignedAt: new Date() },
      $push: { timeline: { type: "RESPONDER_ASSIGNED", message: "A verified responder accepted the request", by: req.user._id, at: new Date() } },
    },
    { new: true }
  );
  if (!won) throw new ApiError(409, "This incident was already taken or is no longer open.");

  asg.status = "accepted";
  asg.respondedAt = new Date();
  await asg.save();
  await expireOthers(won._id, req.user._id);
  await audit(req.user, "INCIDENT_ACCEPTED", "EmergencyIncident", won._id, null, req.ip);
  await notify(won.reporter, {
    type: "INCIDENT_ACCEPTED", title: "A responder accepted your request",
    message: `${req.user.name} accepted ${won.incidentId}. Stay safe and keep your phone nearby.`, data: { incidentId: won._id },
  });
  await broadcast(won, "incident:assigned");
  res.json({ success: true, incident: serializeIncident(await loadIncident(won._id), req.user) });
});

export const declineIncident = asyncHandler(async (req, res) => {
  const asg = await ResponderAssignment.findOneAndUpdate(
    { incident: req.params.id, responder: req.user._id, status: "notified" },
    { status: "declined", respondedAt: new Date(), declineReason: req.body.reason },
    { new: true }
  );
  if (!asg) throw new ApiError(404, "No open request to decline.");
  const inc = await EmergencyIncident.findById(req.params.id);
  if (inc) { addTimeline(inc, "RESPONDER_DECLINED", "A responder declined the request", req.user); await inc.save(); }
  await audit(req.user, "INCIDENT_DECLINED", "EmergencyIncident", req.params.id, { reason: req.body.reason }, req.ip);
  res.json({ success: true });
});

// An assigned responder can step back; the incident goes back to the pool
export const withdrawIncident = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  if (String(inc.assignedResponder?._id) !== String(req.user._id) || inc.status !== "RESPONDER_ASSIGNED") {
    throw new ApiError(409, "You can only withdraw from an incident you accepted before it is in progress.");
  }
  await ResponderAssignment.updateOne({ incident: inc._id, responder: req.user._id }, { status: "cancelled", respondedAt: new Date() });
  inc.assignedResponder = null;
  inc.assignedAt = undefined;
  inc.escalation.lastAt = new Date();
  await changeStatus(inc, "ACKNOWLEDGED", req.user, "Responder withdrew. Looking for another responder.");
  await notifyEligible(inc);
  res.json({ success: true });
});

// ---------- Shared ----------
export const getIncident = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  await assertCanView(inc, req.user);
  const asg = await ResponderAssignment.findOne({ incident: inc._id, responder: req.user._id });
  res.json({ success: true, incident: serializeIncident(inc, req.user, { distanceKm: asg?.distanceKm }) });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const inc = await loadIncident(req.params.id);
  const isAdmin = req.user.role === "admin";
  const isReporter = String(inc.reporter._id) === String(req.user._id);
  const isAssigned = String(inc.assignedResponder?._id) === String(req.user._id);

  const allowed = isAdmin
    ? true
    : (isAssigned && ["IN_PROGRESS", "RESOLVED"].includes(status)) || (isReporter && ["CANCELLED", "CLOSED"].includes(status));
  if (!allowed) throw new ApiError(403, "You are not allowed to make this status change.");
  if (status === "REJECTED" && !isAdmin) throw new ApiError(403, "Only administrators can reject a report.");

  await changeStatus(inc, status, req.user, note);
  res.json({ success: true, incident: serializeIncident(await loadIncident(inc._id), req.user) });
});

export const updateClassification = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  const isReporter = String(inc.reporter._id) === String(req.user._id);
  if (req.user.role !== "admin" && !isReporter) throw new ApiError(403, "Only the reporter or an administrator can correct this.");
  const { category, priority } = req.body;
  const before = { category: inc.category, priority: inc.priority };
  if (category) inc.category = category;
  if (priority && req.user.role === "admin") inc.priority = priority;
  inc.ai.correctedBy = req.user._id;
  inc.ai.needsHumanReview = false;
  addTimeline(inc, "CLASSIFICATION_CORRECTED", `Category/priority corrected by ${req.user.role}`, req.user, { before, after: { category: inc.category, priority: inc.priority } });
  await inc.save();
  await audit(req.user, "INCIDENT_CLASSIFICATION_CORRECTED", "EmergencyIncident", inc._id, { before }, req.ip);
  await broadcast(inc);
  res.json({ success: true, incident: serializeIncident(await loadIncident(inc._id), req.user) });
});

export const getMessages = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  await assertCanView(inc, req.user);
  const full = req.user.role === "admin" || String(inc.reporter._id) === String(req.user._id) || String(inc.assignedResponder?._id) === String(req.user._id);
  if (!full) throw new ApiError(403, "Messages are available after you accept the incident.");
  const messages = await IncidentMessage.find({ incident: inc._id }).populate("sender", "name role").sort({ createdAt: 1 }).limit(200);
  res.json({ success: true, messages });
});

export const postMessage = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  const isAdmin = req.user.role === "admin";
  const isReporter = String(inc.reporter._id) === String(req.user._id);
  const isAssigned = String(inc.assignedResponder?._id) === String(req.user._id);
  if (!isAdmin && !isReporter && !isAssigned) throw new ApiError(403, "Only people on this incident can send messages.");
  if (!OPEN_STATUSES.includes(inc.status) && inc.status !== "RESOLVED") throw new ApiError(409, "This incident is closed.");

  const msg = await IncidentMessage.create({ incident: inc._id, sender: req.user._id, text: req.body.text });
  const payload = { _id: msg._id, incident: inc._id, text: msg.text, createdAt: msg.createdAt, sender: { _id: req.user._id, name: req.user.name, role: req.user.role } };
  emitToIncident(inc._id, "message:new", payload);
  // Also push to personal rooms so people who have not opened the chat still get it
  [inc.reporter._id, inc.assignedResponder?._id].filter(Boolean).forEach((id) => String(id) !== String(req.user._id) && emitToUser(id, "message:new", payload));
  res.status(201).json({ success: true, message: payload });
});

// Citizen turns live location sharing on or off (explicit consent)
export const setLocationSharing = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  if (String(inc.reporter._id) !== String(req.user._id)) throw new ApiError(403, "Only the reporter can change this.");
  inc.shareLocation = req.body.share === true;
  if (!inc.shareLocation) inc.liveLocation = undefined;
  addTimeline(inc, inc.shareLocation ? "LOCATION_SHARING_ON" : "LOCATION_SHARING_OFF", inc.shareLocation ? "Citizen allowed live location sharing" : "Citizen stopped live location sharing", req.user);
  await inc.save();
  await broadcast(inc);
  res.json({ success: true, shareLocation: inc.shareLocation });
});

// ---------- Admin ----------
export const listAll = asyncHandler(async (req, res) => {
  const { status, category, active, duplicates, review, limit = 100 } = req.query;
  const q = {};
  if (status) q.status = status;
  if (category && CATEGORIES.includes(category)) q.category = category;
  if (active === "true") q.status = { $in: OPEN_STATUSES };
  if (duplicates === "true") q.possibleDuplicateOf = { $exists: true, $ne: null };
  if (review === "true") q["ai.needsHumanReview"] = true;
  const list = await EmergencyIncident.find(q).populate(populateFull).sort({ createdAt: -1 }).limit(Math.min(Number(limit) || 100, 300));
  res.json({ success: true, incidents: list.map((i) => serializeIncident(i, req.user)) });
});

export const getEligible = asyncHandler(async (req, res) => {
  const inc = await loadIncident(req.params.id);
  const radius = Number(req.query.radiusKm) || inc.escalation.radiusKm || 10;
  const list = await findEligible(inc, radius);
  // Admin sees only what is needed to assign: name, role, skills, distance
  res.json({
    success: true, radiusKm: radius,
    responders: list.map((c) => ({ id: c.user._id, name: c.user.name, role: c.user.role, skills: c.profile.skills, distanceKm: c.distanceKm, score: c.score })),
  });
});

export const assignIncident = asyncHandler(async (req, res) => {
  const responder = await User.findById(req.body.responderId);
  if (!responder || !["volunteer", "medical_responder", "organization"].includes(responder.role) || responder.verificationStatus !== "verified" || responder.isSuspended) {
    throw new ApiError(400, "Choose a verified, active responder.");
  }
  const busy = await EmergencyIncident.exists({ assignedResponder: responder._id, status: { $in: ["RESPONDER_ASSIGNED", "IN_PROGRESS"] } });
  if (busy) throw new ApiError(409, "That responder already has an active incident.");

  const won = await EmergencyIncident.findOneAndUpdate(
    { _id: req.params.id, assignedResponder: null, status: { $in: ["PENDING", "ACKNOWLEDGED"] } },
    {
      $set: { assignedResponder: responder._id, status: "RESPONDER_ASSIGNED", assignedAt: new Date(), acknowledgedAt: new Date() },
      $push: { timeline: { type: "ADMIN_ASSIGNED", message: `Administrator assigned ${responder.name}`, by: req.user._id, at: new Date() } },
    },
    { new: true }
  );
  if (!won) throw new ApiError(409, "Incident is not open for assignment.");

  await ResponderAssignment.findOneAndUpdate(
    { incident: won._id, responder: responder._id },
    { status: "accepted", assignedBy: req.user._id, respondedAt: new Date() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await expireOthers(won._id, responder._id);
  await audit(req.user, "INCIDENT_ASSIGNED", "EmergencyIncident", won._id, { responder: responder._id }, req.ip);
  await notify(responder._id, { type: "INCIDENT_ASSIGNED", title: "You were assigned an incident", message: `${won.incidentId} was assigned to you by an administrator.`, data: { incidentId: won._id } });
  await notify(won.reporter, { type: "INCIDENT_ACCEPTED", title: "A responder was assigned", message: `${responder.name} is assigned to ${won.incidentId}.`, data: { incidentId: won._id } });
  await broadcast(won, "incident:assigned");
  res.json({ success: true, incident: serializeIncident(await loadIncident(won._id), req.user) });
});
