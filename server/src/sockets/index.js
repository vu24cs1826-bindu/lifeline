import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import EmergencyIncident from "../models/EmergencyIncident.js";
import ResponderAssignment from "../models/ResponderAssignment.js";
import { setIO, emitToIncident } from "./io.js";

export default function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL?.split(","), credentials: true },
  });
  setIO(io);

  // Every connection must send a valid JWT
  io.use(async (socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || user.isSuspended) return next(new Error("unauthorized"));
      socket.user = user;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const u = socket.user;
    socket.join(`user:${u._id}`);
    socket.join(`role:${u.role}`);

    // A user may join an incident room only if they belong to that incident
    socket.on("incident:join", async (incidentId, ack) => {
      try {
        const inc = await EmergencyIncident.findById(incidentId).select("reporter assignedResponder");
        if (!inc) return ack?.({ ok: false });
        const involved =
          u.role === "admin" ||
          String(inc.reporter) === String(u._id) ||
          String(inc.assignedResponder) === String(u._id);
        if (!involved) return ack?.({ ok: false });
        socket.join(`incident:${incidentId}`);
        ack?.({ ok: true });
      } catch {
        ack?.({ ok: false });
      }
    });

    socket.on("incident:leave", (incidentId) => socket.leave(`incident:${incidentId}`));

    // Live location: only with the citizen's consent (shareLocation) or from the assigned responder
    socket.on("location:update", async ({ incidentId, lat, lng } = {}) => {
      try {
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const inc = await EmergencyIncident.findById(incidentId);
        if (!inc) return;
        const isReporter = String(inc.reporter) === String(u._id);
        const isAssigned = String(inc.assignedResponder) === String(u._id);
        if (isReporter && inc.shareLocation) {
          inc.liveLocation = { coordinates: [lng, lat], at: new Date() };
          await inc.save();
          emitToIncident(incidentId, "location:update", { from: "citizen", lat, lng, at: inc.liveLocation.at });
        } else if (isAssigned) {
          emitToIncident(incidentId, "location:update", { from: "responder", lat, lng, at: new Date() });
        }
      } catch (e) {
        console.error("location:update error", e.message);
      }
    });
  });

  return io;
}
