import CommunityReport, { REPORT_CATEGORIES } from "../models/CommunityReport.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import audit from "../utils/audit.js";
import { point, validCoords } from "../utils/geo.js";
import { notify } from "../services/notificationService.js";

const pub = (r) => ({
  id: r._id, category: r.category, title: r.title, description: r.description, address: r.address,
  location: { coordinates: r.location.coordinates }, images: r.images, status: r.status, createdAt: r.createdAt,
});

export const createReport = asyncHandler(async (req, res) => {
  const { category, title, description, address, lat, lng } = req.body;
  if (!validCoords(lat, lng)) throw new ApiError(400, "A valid location is required.");
  const report = await CommunityReport.create({
    reporter: req.user._id, category, title, description, address, location: point(lat, lng),
    images: (req.files || []).map((f) => `/uploads/${f.filename}`),
  });
  res.status(201).json({ success: true, report: pub(report) });
});

// Public list: only verified reports. Filters: category, lat/lng/radiusKm
export const listVerified = asyncHandler(async (req, res) => {
  const { category, lat, lng, radiusKm = 25 } = req.query;
  const q = { status: "verified" };
  if (category && REPORT_CATEGORIES.includes(category)) q.category = category;
  if (validCoords(lat, lng)) q.location = { $nearSphere: { $geometry: point(lat, lng), $maxDistance: Number(radiusKm) * 1000 } };
  const list = await CommunityReport.find(q).sort({ createdAt: -1 }).limit(200);
  res.json({ success: true, reports: list.map(pub) });
});

export const listMine = asyncHandler(async (req, res) => {
  const list = await CommunityReport.find({ reporter: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, reports: list.map((r) => ({ ...pub(r), moderationNote: r.moderationNote })) });
});

// Admin: moderation queue
export const listForModeration = asyncHandler(async (req, res) => {
  const status = req.query.status || "pending";
  const list = await CommunityReport.find({ status }).populate("reporter", "name").sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, reports: list.map((r) => ({ ...pub(r), reporter: r.reporter?.name })) });
});

export const moderate = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const r = await CommunityReport.findByIdAndUpdate(req.params.id, { status, moderationNote: note, moderator: req.user._id }, { new: true });
  if (!r) throw new ApiError(404, "Report not found.");
  await audit(req.user, "COMMUNITY_REPORT_MODERATED", "CommunityReport", r._id, { status }, req.ip);
  await notify(r.reporter, { type: "REPORT_STATUS", title: `Your safety report was ${status}`, message: note || r.title });
  res.json({ success: true, report: pub(r) });
});
