import "dotenv/config";
import app from "../src/app.js";
import http from "http";
import connectDB from "../src/config/db.js";
import User from "../src/models/User.js";
import EmergencyIncident from "../src/models/EmergencyIncident.js";
import SimulationScenario from "../src/models/SimulationScenario.js";
import jwt from "jsonwebtoken";

async function run() {
  await connectDB();
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  const base = "http://localhost:5099/api";

  const admin = await User.findOne({ role: "admin" });
  const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  let passed = 0;
  let failed = 0;

  async function check(name, resPromise, validator) {
    try {
      const res = await resPromise;
      const data = await res.json();
      if (res.ok && validator(data)) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name}`, res.status, data);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] ${name} threw error:`, err.message);
      failed++;
    }
  }

  console.log("\n--- Testing LifeLine Intelligence Layer APIs ---");

  // 1. Digital Twin
  await check(
    "GET /api/intelligence/digital-twin",
    fetch(`${base}/intelligence/digital-twin`, { headers: authHeaders }),
    (d) => d.success && d.layers.activeIncidents && d.layers.predictiveRiskZones
  );

  // 2. Situations
  await check(
    "GET /api/intelligence/situations",
    fetch(`${base}/intelligence/situations`, { headers: authHeaders }),
    (d) => d.success && Array.isArray(d.situations) && d.situations.length > 0
  );

  // 3. Cluster Synthesis
  await check(
    "POST /api/intelligence/clusters/synthesize",
    fetch(`${base}/intelligence/clusters/synthesize`, { method: "POST", headers: authHeaders }),
    (d) => d.success && d.result.synthesized >= 0
  );

  // 4. Predictive Risk
  await check(
    "GET /api/intelligence/predictive-risk",
    fetch(`${base}/intelligence/predictive-risk`, { headers: authHeaders }),
    (d) => d.success && d.summary.averageMunicipalRiskScore > 0 && d.zones.length > 0
  );

  // 5. Facilities
  await check(
    "GET /api/intelligence/facilities",
    fetch(`${base}/intelligence/facilities`, { headers: authHeaders }),
    (d) => d.success && d.facilities.length > 0
  );

  // 6. Resource Coordination
  const sampleIncident = await EmergencyIncident.findOne();
  if (sampleIncident) {
    await check(
      "POST /api/intelligence/coordination/recommend",
      fetch(`${base}/intelligence/coordination/recommend`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ incidentId: sampleIncident._id }),
      }),
      (d) => d.success && d.recommendation?.recommendedPackage?.dispatchRationale
    );
  }

  // 7. Crisis Simulation
  const scenario = await SimulationScenario.findOne();
  if (scenario) {
    await check(
      "POST /api/intelligence/simulations/run",
      fetch(`${base}/intelligence/simulations/run`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ scenarioId: scenario.scenarioId, customParameters: { rainfallMmPerHour: 80 } }),
      }),
      (d) => d.success && d.simulation?.timelineSteps?.length > 0 && d.simulation?.isSimulationData
    );
  }

  // 8. Prevention Proposals
  await check(
    "GET /api/intelligence/prevention",
    fetch(`${base}/intelligence/prevention`, { headers: authHeaders }),
    (d) => d.success && d.report?.proposals?.length > 0
  );

  console.log(`\nResults: ${passed} passed, ${failed} failed.\n`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

run();
