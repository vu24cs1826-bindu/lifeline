import User from "../models/User.js";
import ResponderProfile from "../models/ResponderProfile.js";
import Organization from "../models/Organization.js";
import EmergencyIncident, { OPEN_STATUSES } from "../models/EmergencyIncident.js";
import CommunityReport from "../models/CommunityReport.js";
import AuditLog from "../models/AuditLog.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import audit from "../utils/audit.js";
import { notify } from "../services/notificationService.js";

export const stats = asyncHandler(async (req, res) => {
  const [users, incidents, active, resolved, pendingVerification, availableResponders, pendingReports, byCategory] = await Promise.all([
    User.countDocuments(),
    EmergencyIncident.countDocuments(),
    EmergencyIncident.countDocuments({ status: { $in: OPEN_STATUSES } }),
    EmergencyIncident.countDocuments({ status: { $in: ["RESOLVED", "CLOSED"] } }),
    User.countDocuments({ verificationStatus: "pending" }),
    ResponderProfile.countDocuments({ available: true, verified: true }),
    CommunityReport.countDocuments({ status: "pending" }),
    EmergencyIncident.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
  ]);
  res.json({
    success: true,
    stats: { users, incidents, active, resolved, pendingVerification, availableResponders, pendingReports },
    byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { role, q, verification } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (verification) filter.verificationStatus = verification;
  if (q) filter.$or = [{ name: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }];
  const users = await User.find(filter).select("name email role verificationStatus isSuspended createdAt").sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, users });
});

export const setVerification = asyncHandler(async (req, res) => {
  const { status, note } = req.body; // verified | rejected
  const user = await User.findById(req.params.id);
  if (!user || !["volunteer", "medical_responder", "organization"].includes(user.role)) throw new ApiError(404, "Responder account not found.");
  user.verificationStatus = status;
  await user.save();
  await ResponderProfile.updateOne({ user: user._id }, { verified: status === "verified", ...(status !== "verified" && { available: false }) });
  await Organization.updateOne({ owner: user._id }, { status: status === "verified" ? "verified" : "rejected" });
  await audit(req.user, `RESPONDER_${status.toUpperCase()}`, "User", user._id, { note }, req.ip);
  await notify(user._id, { type: "VERIFICATION", title: status === "verified" ? "You are verified" : "Verification was not approved", message: note || (status === "verified" ? "You can now go available and receive requests." : "Contact support for details.") });
  res.json({ success: true, user: { id: user._id, verificationStatus: user.verificationStatus } });
});

export const setSuspension = asyncHandler(async (req, res) => {
  const { suspend, reason } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found.");
  if (user.role === "admin") throw new ApiError(400, "Administrator accounts cannot be suspended here.");
  user.isSuspended = suspend === true;
  user.suspendedReason = suspend ? reason : undefined;
  await user.save();
  if (suspend) await ResponderProfile.updateOne({ user: user._id }, { available: false });
  await audit(req.user, suspend ? "USER_SUSPENDED" : "USER_REINSTATED", "User", user._id, { reason }, req.ip);
  res.json({ success: true, isSuspended: user.isSuspended });
});

export const listOrganizations = asyncHandler(async (req, res) => {
  const orgs = await Organization.find().populate("owner", "name email").sort({ createdAt: -1 });
  res.json({ success: true, organizations: orgs });
});

export const setOrganizationStatus = asyncHandler(async (req, res) => {
  const org = await Organization.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!org) throw new ApiError(404, "Organization not found.");
  await audit(req.user, "ORGANIZATION_STATUS", "Organization", org._id, { status: req.body.status }, req.ip);
  res.json({ success: true, organization: org });
});

export const auditLogs = asyncHandler(async (req, res) => {
  const filter = req.query.action ? { action: req.query.action } : {};
  const logs = await AuditLog.find(filter).populate("actor", "name role").sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit) || 100, 300));
  res.json({ success: true, logs });
});

// Map data for the admin monitoring map (admins may see exact locations)
export const mapIncidents = asyncHandler(async (req, res) => {
  const list = await EmergencyIncident.find({ status: { $in: OPEN_STATUSES } }).select("incidentId category status priority location createdAt").limit(300);
  res.json({ success: true, incidents: list });
});
