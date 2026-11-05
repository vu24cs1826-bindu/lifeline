import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import path from "path";
import { fileURLToPath } from "url";
import { generalLimiter, authLimiter } from "./middleware/rateLimiters.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import responderRoutes from "./routes/responderRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import intelligenceRoutes from "./routes/intelligenceRoutes.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // lets the React app show uploaded images
const rawOrigins = process.env.CLIENT_URL || "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173";
const allowedOrigins = rawOrigins.split(",").map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".onrender.com")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "20kb" }));
app.use(mongoSanitize()); // blocks NoSQL injection like {"$gt": ""}
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Static assets
const clientDistPath = path.join(__dirname, "../../client/dist");
app.use(express.static(clientDistPath));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api", generalLimiter);
app.use("/api/auth", authLimiter);

app.get("/api/health", (req, res) => res.json({ success: true, message: "LifeLine API running" }));
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/responders", responderRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/intelligence", intelligenceRoutes);

// Fallback to React index.html for SPA routing if not an API route
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path.startsWith("/socket.io")) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) next();
  });
});

app.use(notFound);
app.use(errorHandler);

export default app;
