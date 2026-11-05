import { Router } from "express";
import { body, param, query } from "express-validator";
import { protect, authorize, requireVerified } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { sosLimiter } from "../middleware/rateLimiters.js";
import { CATEGORIES, STATUSES } from "../models/EmergencyIncident.js";
import * as c from "../controllers/incidentController.js";

const router = Router();
const id = param("id").isMongoId().withMessage("Invalid incident ID.");
const RESPONDERS = ["volunteer", "medical_responder", "organization"];

router.use(protect);

router.post("/", authorize("citizen", "volunteer", "medical_responder", "organization"), sosLimiter, [
  body("category").optional().isIn(CATEGORIES).withMessage("Invalid category."),
  body("description").optional({ values: "falsy" }).trim().isLength({ max: 1000 }).withMessage("Description is too long (max 1000)."),
  body("lat").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required."),
  body("lng").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required."),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("shareLocation").optional().isBoolean(),
  body("silent").optional().isBoolean(),
], validate, c.createIncident);

router.get("/mine", c.listMine);
router.get("/available", authorize(...RESPONDERS), requireVerified, c.listAvailable);
router.get("/assigned", authorize(...RESPONDERS), c.listAssigned);
router.get("/", authorize("admin"), c.listAll);

router.get("/:id", id, validate, c.getIncident);
router.post("/:id/accept", authorize(...RESPONDERS), requireVerified, id, validate, c.acceptIncident);
router.post("/:id/decline", authorize(...RESPONDERS), requireVerified, id, [body("reason").optional().trim().isLength({ max: 200 })], validate, c.declineIncident);
router.post("/:id/withdraw", authorize(...RESPONDERS), id, validate, c.withdrawIncident);
router.patch("/:id/status", id, [body("status").isIn(STATUSES).withMessage("Invalid status."), body("note").optional().trim().isLength({ max: 500 })], validate, c.updateStatus);
router.patch("/:id/classification", id, [body("category").optional().isIn(CATEGORIES), body("priority").optional().isIn(["low", "medium", "high", "critical"])], validate, c.updateClassification);
router.patch("/:id/location-sharing", id, [body("share").isBoolean()], validate, c.setLocationSharing);
router.get("/:id/messages", id, validate, c.getMessages);
router.post("/:id/messages", id, [body("text").trim().isLength({ min: 1, max: 500 }).withMessage("Message must be 1-500 characters.")], validate, c.postMessage);

router.get("/:id/eligible", authorize("admin"), id, validate, c.getEligible);
router.post("/:id/assign", authorize("admin"), id, [body("responderId").isMongoId().withMessage("Choose a responder.")], validate, c.assignIncident);

export default router;
