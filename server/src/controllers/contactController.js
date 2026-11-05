import EmergencyContact from "../models/EmergencyContact.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const listContacts = asyncHandler(async (req, res) => {
  res.json({ success: true, contacts: await EmergencyContact.find({ owner: req.user._id }).sort({ createdAt: 1 }) });
});

export const addContact = asyncHandler(async (req, res) => {
  const count = await EmergencyContact.countDocuments({ owner: req.user._id });
  if (count >= 10) throw new ApiError(400, "You can save up to 10 contacts.");
  const { name, phone, relationship, isTrusted } = req.body;
  const contact = await EmergencyContact.create({ owner: req.user._id, name, phone, relationship, isTrusted });
  res.status(201).json({ success: true, contact });
});

export const updateContact = asyncHandler(async (req, res) => {
  const { name, phone, relationship, isTrusted } = req.body;
  const contact = await EmergencyContact.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { name, phone, relationship, isTrusted },
    { new: true, omitUndefined: true, runValidators: true }
  );
  if (!contact) throw new ApiError(404, "Contact not found.");
  res.json({ success: true, contact });
});

export const deleteContact = asyncHandler(async (req, res) => {
  const r = await EmergencyContact.deleteOne({ _id: req.params.id, owner: req.user._id });
  if (!r.deletedCount) throw new ApiError(404, "Contact not found.");
  res.json({ success: true });
});
