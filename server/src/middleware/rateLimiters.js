import rateLimit from "express-rate-limit";

const base = { standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many requests. Please slow down." } };

export const generalLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, max: 600 });
export const authLimiter = rateLimit({ ...base, windowMs: 15 * 60 * 1000, max: 30 });
export const sosLimiter = rateLimit({ ...base, windowMs: 60 * 60 * 1000, max: 15 });
