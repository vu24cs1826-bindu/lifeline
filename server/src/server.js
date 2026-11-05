import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import initSocket from "./sockets/index.js";
import { startEscalationWorker } from "./services/escalationService.js";

for (const key of ["MONGO_URI", "JWT_SECRET"]) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}. Copy .env.example to .env and fill it in.`);
    process.exit(1);
  }
}
if (!process.env.CLIENT_URL) {
  process.env.CLIENT_URL = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173";
}
if (process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be at least 32 characters.");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initSocket(server);

connectDB()
  .then(() => {
    startEscalationWorker();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(process.env.ANTHROPIC_API_KEY ? "AI classification: enabled" : "AI classification: no key set, using the built-in fallback");
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  });
