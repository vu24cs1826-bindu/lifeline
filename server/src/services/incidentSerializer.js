import { approxCoords, distanceKm } from "../utils/geo.js";

const idOf = (v) => String(v?._id || v || "");

// Decides what each person is allowed to see. Exact location and reporter details
// are shown only to the reporter, the assigned responder and admins.
export function serializeIncident(inc, viewer, opts = {}) {
  const o = inc.toObject ? inc.toObject() : inc;
  const uid = String(viewer._id);
  const isReporter = idOf(o.reporter) === uid;
  const isAssigned = !!o.assignedResponder && idOf(o.assignedResponder) === uid;
  const isAdmin = viewer.role === "admin";
  const full = isReporter || isAssigned || isAdmin;

  const out = {
    id: o._id,
    incidentId: o.incidentId,
    category: o.category,
    description: o.description,
    status: o.status,
    priority: o.priority,
    silent: o.silent,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    ai: o.ai,
    assignedResponder: o.assignedResponder
      ? { id: idOf(o.assignedResponder), name: o.assignedResponder.name }
      : null,
    escalation: isAdmin ? o.escalation : undefined,
    possibleDuplicateOf: isAdmin ? o.possibleDuplicateOf : undefined,
    locationApproximate: !full,
    location: { coordinates: full ? o.location.coordinates : approxCoords(o.location.coordinates) },
    distanceKm: opts.distanceKm,
    iAmReporter: isReporter,
    iAmAssigned: isAssigned,
  };

  if (full) {
    out.address = o.address;
    out.shareLocation = o.shareLocation;
    out.resolution = o.resolution;
    out.timeline = (o.timeline || []).map((t) => ({ type: t.type, message: t.message, at: t.at }));
    if (!isReporter && o.reporter?.name) out.reporter = { name: o.reporter.name, phone: o.reporter.phone };
    // Live location is only shared when the citizen explicitly agreed
    if (o.shareLocation && o.liveLocation?.coordinates?.length) out.liveLocation = o.liveLocation;
  }
  if (opts.fromCoords && !out.distanceKm) out.distanceKm = distanceKm(opts.fromCoords, o.location.coordinates);
  return out;
}
