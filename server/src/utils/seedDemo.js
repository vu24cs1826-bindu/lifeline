import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import ResponderProfile from "../models/ResponderProfile.js";
import { point } from "./geo.js";

// DEMONSTRATION DATA ONLY. Do not use these accounts in production.
// All demo responders are placed near Guntur, Andhra Pradesh. Change DEMO_LAT / DEMO_LNG to move them.
const lat = Number(process.env.DEMO_LAT || 16.3067);
const lng = Number(process.env.DEMO_LNG || 80.4365);
const PASSWORD = "DemoPass123";

const accounts = [
  { name: "Demo Citizen", email: "citizen@demo.lifeline", role: "citizen" },
  { name: "Demo Volunteer", email: "volunteer@demo.lifeline", role: "volunteer", skills: ["first_aid", "driving"] },
  { name: "Demo Medic", email: "medic@demo.lifeline", role: "medical_responder", skills: ["first_aid", "cpr", "ambulance"], qualification: "Demo paramedic (not a real qualification)" },
];

await mongoose.connect(process.env.MONGO_URI);
for (const [i, a] of accounts.entries()) {
  if (await User.findOne({ email: a.email })) { console.log("exists:", a.email); continue; }
  const isResponder = a.role !== "citizen";
  const user = await User.create({ name: a.name, email: a.email, password: PASSWORD, role: a.role, verificationStatus: isResponder ? "verified" : "not_required" });
  if (isResponder) {
    await ResponderProfile.create({ user: user._id, skills: a.skills, qualification: a.qualification, verified: true, available: true, location: point(lat + 0.01 * i, lng + 0.01 * i), locationUpdatedAt: new Date() });
  }
  console.log("created:", a.email);
}
console.log(`Demo password for all demo accounts: ${PASSWORD}`);
await mongoose.disconnect();
