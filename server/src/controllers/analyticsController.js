import EmergencyIncident from "../models/EmergencyIncident.js";
import asyncHandler from "../utils/asyncHandler.js";

const avg = (field) => ({ $avg: field });

export const overview = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 365 * 24 * 3600 * 1000);

  const [byCategory, monthly, hotspots, response, performance] = await Promise.all([
    EmergencyIncident.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    EmergencyIncident.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { y: { $year: "$createdAt" }, m: { $month: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.y": 1, "_id.m": 1 } },
    ]),
    // Frequently reported places, grouped to about 1 km cells
    EmergencyIncident.aggregate([
      { $group: {
          _id: { lng: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 2] }, lat: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 2] } },
          count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 },
    ]),
    EmergencyIncident.aggregate([
      { $match: { assignedAt: { $ne: null } } },
      { $group: { _id: null,
          avgToAssignMs: avg({ $subtract: ["$assignedAt", "$createdAt"] }),
          avgToResolveMs: avg({ $cond: [{ $ifNull: ["$resolvedAt", false] }, { $subtract: ["$resolvedAt", "$createdAt"] }, null] }),
          samples: { $sum: 1 } } },
    ]),
    EmergencyIncident.aggregate([
      { $match: { assignedResponder: { $ne: null } } },
      { $group: { _id: "$assignedResponder", assigned: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $in: ["$status", ["RESOLVED", "CLOSED"]] }, 1, 0] } },
          avgAssignMs: avg({ $subtract: ["$assignedAt", "$createdAt"] }) } },
      { $sort: { resolved: -1 } }, { $limit: 10 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
      { $project: { name: { $arrayElemAt: ["$u.name", 0] }, assigned: 1, resolved: 1, avgAssignMinutes: { $round: [{ $divide: ["$avgAssignMs", 60000] }, 1] } } },
    ]),
  ]);

  const r = response[0];
  res.json({
    success: true,
    byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    monthly: monthly.map((m) => ({ month: `${m._id.y}-${String(m._id.m).padStart(2, "0")}`, count: m.count })),
    hotspots: hotspots.map((h) => ({ lat: h._id.lat, lng: h._id.lng, count: h.count })),
    responseTimes: r ? {
      avgMinutesToAssign: Math.round((r.avgToAssignMs / 60000) * 10) / 10,
      avgMinutesToResolve: r.avgToResolveMs ? Math.round((r.avgToResolveMs / 60000) * 10) / 10 : null,
      samples: r.samples,
    } : null,
    responderPerformance: performance,
  });
});
