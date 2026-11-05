import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { emitToUser } from "../sockets/io.js";

export async function notify(userId, { type, title, message, data }) {
  const n = await Notification.create({ user: userId, type, title, message, data });
  emitToUser(userId, "notification:new", n);
  return n;
}

export async function notifyAdmins(payload) {
  const admins = await User.find({ role: "admin", isSuspended: false }).select("_id");
  await Promise.all(admins.map((a) => notify(a._id, payload)));
}
