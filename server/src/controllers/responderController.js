import ResponderProfile, { SKILLS } from "../models/ResponderProfile.js";
import EmergencyIncident from "../models/EmergencyIncident.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { point, validCoords } from "../utils/geo.js";

const getProfile = async (userId) => {
  const p = await ResponderProfile.findOne({ user: userId }).populate("organization", "name status");
  if (!p) throw new ApiError(404, "Responder profile not found.");
  return p;
};

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user._id);
  const active = await EmergencyIncident.countDocuments({ assignedResponder: req.user._id, status: { $in: ["RESPONDER_ASSIGNED", "IN_PROGRESS"] } });
  res.json({ success: true, profile, activeIncidents: active, verificationStatus: req.user.verificationStatus });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user._id);
  if (req.body.skills) profile.skills = req.body.skills.filter((s) => SKILLS.includes(s));
  if (req.body.qualification !== undefined) profile.qualification = req.body.qualification;
  await profile.save();
  res.json({ success: true, profile });
});

// Responders must be verified and must share a location before they can be available
export const setAvailability = asyncHandler(async (req, res) => {
  const profile = await getProfile(req.user._id);
  if (req.body.available) {
    if (req.user.verificationStatus !== "verified") throw new ApiError(403, "You can go available only after an administrator verifies you.");
    if (!profile.location?.coordinates?.length) throw new ApiError(400, "Share your location first so we can match nearby incidents.");
  }
  profile.available = req.body.available === true;
  await profile.save();
  res.json({ success: true, available: profile.available });
});

export const setLocation = asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  if (!validCoords(lat, lng)) throw new ApiError(400, "Invalid coordinates.");
  const profile = await getProfile(req.user._id);
  profile.location = point(lat, lng);
  profile.locationUpdatedAt = new Date();
  await profile.save();
  res.json({ success: true });
});
