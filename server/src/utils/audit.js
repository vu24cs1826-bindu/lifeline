import AuditLog from "../models/AuditLog.js";

export default async function audit(actor, action, targetType, targetId, details, ip) {
  try {
    await AuditLog.create({ actor: actor?._id || actor || undefined, action, targetType, targetId, details, ip });
  } catch (e) {
    console.error("Audit log failed:", e.message);
  }
}
