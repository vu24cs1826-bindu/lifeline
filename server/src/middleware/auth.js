import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) throw new ApiError(401, "Not logged in.");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User no longer exists.");
  if (user.isSuspended) throw new ApiError(403, "Account suspended.");

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return next(new ApiError(403, "You do not have permission."));
  next();
};

// Responders must be verified by an admin before they can act on incidents
export const requireVerified = (req, res, next) => {
  if (req.user.verificationStatus !== "verified") {
    return next(new ApiError(403, "Your account must be verified by an administrator first."));
  }
  next();
};
