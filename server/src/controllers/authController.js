import User, { RESPONDER_ROLES } from "../models/User.js";
import ResponderProfile, { SKILLS } from "../models/ResponderProfile.js";
import Organization from "../models/Organization.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import audit from "../utils/audit.js";
import { notifyAdmins } from "../services/notificationService.js";

export const publicUser = (u) => ({
  id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role,
  verificationStatus: u.verificationStatus, createdAt: u.createdAt,
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role = "citizen", skills = [], qualification, organizationName } = req.body;
  const isResponder = RESPONDER_ROLES.includes(role);

  const user = await User.create({
    name, email, password, phone, role,
    verificationStatus: isResponder ? "pending" : "not_required",
  });

  if (isResponder) {
    let organization;
    if (role === "organization") {
      organization = await Organization.create({ name: organizationName || `${name}'s organization`, owner: user._id, contactPhone: phone });
    }
    await ResponderProfile.create({
      user: user._id,
      organization: organization?._id,
      skills: skills.filter((s) => SKILLS.includes(s)),
      qualification,
    });
    await notifyAdmins({ type: "VERIFICATION_REQUEST", title: "New verification request", message: `${name} registered as ${role.replace("_", " ")}.`, data: { userId: user._id } });
  }

  await audit(user, "USER_REGISTERED", "User", user._id, { role }, req.ip);
  res.status(201).json({ success: true, token: generateToken(user._id), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  // Same message in both cases so attackers cannot learn which emails exist
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, "Invalid email or password.");
  if (user.isSuspended) throw new ApiError(403, "Account suspended.");

  user.lastLoginAt = new Date();
  await user.save();
  await audit(user, "USER_LOGIN", "User", user._id, null, req.ip);
  res.json({ success: true, token: generateToken(user._id), user: publicUser(user) });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

export const updateMe = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  res.json({ success: true, user: publicUser(req.user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.matchPassword(req.body.currentPassword))) throw new ApiError(400, "Current password is wrong.");
  user.password = req.body.newPassword;
  await user.save();
  await audit(user, "PASSWORD_CHANGED", "User", user._id, null, req.ip);
  res.json({ success: true, message: "Password updated." });
});
