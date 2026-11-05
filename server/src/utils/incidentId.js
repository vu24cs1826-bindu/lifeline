import crypto from "crypto";

export default function generateIncidentId() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `LL-${d}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}
