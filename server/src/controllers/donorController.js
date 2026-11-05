import BloodDonor from "../models/BloodDonor.js";
import DonationRequest from "../models/DonationRequest.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { point, validCoords, distanceKm } from "../utils/geo.js";
import { notify } from "../services/notificationService.js";

export const MEDICAL_NOTE = "Blood group alone does not confirm compatibility or eligibility. A qualified medical professional must confirm both before any donation.";

export const registerDonor = asyncHandler(async (req, res) => {
  const { bloodGroup, city, lat, lng, available = true, lastDonationDate } = req.body;
  const data = { bloodGroup, city, available, lastDonationDate };
  if (validCoords(lat, lng)) data.location = point(lat, lng);
  const donor = await BloodDonor.findOneAndUpdate({ user: req.user._id }, { $set: data }, { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true });
  res.status(201).json({ success: true, donor });
});

export const getMyDonor = asyncHandler(async (req, res) => {
  res.json({ success: true, donor: await BloodDonor.findOne({ user: req.user._id }) });
});

// Search shows NO contact details: first name, blood group, city and distance only
export const searchDonors = asyncHandler(async (req, res) => {
  const { bloodGroup, city, lat, lng, radiusKm = 25 } = req.query;
  const q = { available: true, user: { $ne: req.user._id } };
  if (bloodGroup) q.bloodGroup = bloodGroup;
  if (validCoords(lat, lng)) {
    q.location = { $nearSphere: { $geometry: point(lat, lng), $maxDistance: Number(radiusKm) * 1000 } };
  } else if (city) {
    q.city = new RegExp(`^${city.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  }
  const donors = await BloodDonor.find(q).populate("user", "name isSuspended").limit(40);
  res.json({
    success: true, note: MEDICAL_NOTE,
    donors: donors.filter((d) => !d.user.isSuspended).map((d) => ({
      id: d._id, firstName: d.user.name.split(" ")[0], bloodGroup: d.bloodGroup, city: d.city,
      distanceKm: validCoords(lat, lng) && d.location?.coordinates?.length ? distanceKm([Number(lng), Number(lat)], d.location.coordinates) : undefined,
    })),
  });
});

export const sendRequest = asyncHandler(async (req, res) => {
  const donor = await BloodDonor.findById(req.params.id);
  if (!donor || !donor.available) throw new ApiError(404, "Donor not available.");
  if (String(donor.user) === String(req.user._id)) throw new ApiError(400, "You cannot request yourself.");
  const recent = await DonationRequest.findOne({ requester: req.user._id, donor: donor._id, status: "pending" });
  if (recent) throw new ApiError(409, "You already have a pending request for this donor.");

  const { hospital, message, urgency } = req.body;
  const reqDoc = await DonationRequest.create({ requester: req.user._id, donor: donor._id, bloodGroup: donor.bloodGroup, hospital, message, urgency });
  await notify(donor.user, {
    type: "DONATION_REQUEST", title: `${urgency === "urgent" ? "Urgent b" : "B"}lood request (${donor.bloodGroup})`,
    message: `${hospital ? `At ${hospital}. ` : ""}Open your donor page to accept or decline.`, data: { requestId: reqDoc._id },
  });
  res.status(201).json({ success: true, request: reqDoc, note: MEDICAL_NOTE });
});

export const incomingRequests = asyncHandler(async (req, res) => {
  const donor = await BloodDonor.findOne({ user: req.user._id });
  if (!donor) return res.json({ success: true, requests: [] });
  const list = await DonationRequest.find({ donor: donor._id }).populate("requester", "name phone").sort({ createdAt: -1 }).limit(50);
  // Requester phone is shown to the donor only after the donor accepts
  res.json({
    success: true,
    requests: list.map((r) => ({
      id: r._id, bloodGroup: r.bloodGroup, hospital: r.hospital, message: r.message, urgency: r.urgency, status: r.status, createdAt: r.createdAt,
      requester: { name: r.requester.name, phone: r.status === "accepted" ? r.requester.phone : undefined },
    })),
  });
});

export const outgoingRequests = asyncHandler(async (req, res) => {
  const list = await DonationRequest.find({ requester: req.user._id }).populate({ path: "donor", populate: { path: "user", select: "name phone" } }).sort({ createdAt: -1 }).limit(50);
  // Donor phone is revealed to the requester only after the donor accepts
  res.json({
    success: true,
    requests: list.map((r) => ({
      id: r._id, bloodGroup: r.bloodGroup, hospital: r.hospital, urgency: r.urgency, status: r.status, createdAt: r.createdAt,
      donor: { firstName: r.donor.user.name.split(" ")[0], phone: r.status === "accepted" ? r.donor.user.phone : undefined },
    })),
  });
});

export const respondRequest = asyncHandler(async (req, res) => {
  const donor = await BloodDonor.findOne({ user: req.user._id });
  const r = donor && (await DonationRequest.findOne({ _id: req.params.id, donor: donor._id, status: "pending" }));
  if (!r) throw new ApiError(404, "Pending request not found.");
  r.status = req.body.accept ? "accepted" : "declined";
  r.respondedAt = new Date();
  await r.save();
  await notify(r.requester, {
    type: "DONATION_RESPONSE", title: req.body.accept ? "A donor accepted your request" : "A donor declined your request",
    message: req.body.accept ? "Open Blood Donors to see the contact number. Confirm eligibility with a medical professional." : "You can try another donor.",
  });
  res.json({ success: true, status: r.status, note: MEDICAL_NOTE });
});
