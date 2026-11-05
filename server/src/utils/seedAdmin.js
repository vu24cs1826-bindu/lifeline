import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGO_URI);
const email = (process.env.ADMIN_EMAIL || "").toLowerCase();
if (!email || !process.env.ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.");
  process.exit(1);
}
if (await User.findOne({ email })) {
  console.log("Admin already exists:", email);
} else {
  await User.create({ name: process.env.ADMIN_NAME || "LifeLine Admin", email, password: process.env.ADMIN_PASSWORD, role: "admin", verificationStatus: "verified" });
  console.log("Admin created:", email);
}
await mongoose.disconnect();
