import { Router } from "express";
import { body, param, query } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import * as c from "../controllers/intelligenceController.js";

const router = Router();
const id = param("id").isMongoId().withMessage("Invalid ID.");

// Public intelligence feeds (accessible to citizens and visitors)
router.get("/digital-twin", c.getDigitalTwin);
router.get("/situations", c.getSituations);
router.get("/predictive-risk", c.getPredictiveRisk);
router.get("/facilities", c.getFacilities);
router.get("/simulations", c.getSimulationScenarios);
router.get("/prevention", c.getPreventionIntelligence);
router.get("/iot-sensors", c.getIoTSensors);
router.get("/broadcasts", c.getBroadcasts);
router.get("/traffic-corridors", c.getTrafficCorridors);

// Protected actions and mutations (requires JWT authentication)
router.use(protect);

router.post("/clusters/synthesize", authorize("admin", "organization"), c.triggerSynthesis);
router.patch("/clusters/:id/moderate", authorize("admin"), id, [
  body("status").optional().isIn(["developing", "escalating", "stabilized", "contained", "resolved", "dismissed"]),
  body("verificationNote").optional().trim().isLength({ max: 300 }),
], validate, c.moderateCluster);

router.patch("/facilities/:id/capacity", authorize("admin", "organization"), id, c.updateFacilityCapacity);

router.post("/coordination/recommend", authorize("admin", "organization", "medical_responder"), [
  body("incidentId").isMongoId().withMessage("Valid incident ID required."),
], validate, c.getResourceRecommendation);

router.post("/simulations/run", authorize("admin", "organization"), [
  body("scenarioId").trim().notEmpty().withMessage("Scenario ID is required."),
], validate, c.executeSimulation);

router.patch("/prevention/:id/status", authorize("admin"), id, [
  body("status").isIn(["proposed", "under_civic_review", "budget_approved", "in_execution", "completed"]),
  body("reviewNotes").optional().trim().isLength({ max: 500 }),
], validate, c.updateProposalStatus);

// Extension Features
router.post("/iot-sensors/:id/simulate-spike", c.simulateSensorSpike);
router.post("/iot-sensors/:id/reset", c.resetSensor);
router.post("/broadcasts", c.sendBroadcast);
router.post("/traffic-corridors/preempt", c.preemptTrafficCorridor);

export default router;
