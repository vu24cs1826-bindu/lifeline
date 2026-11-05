import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { CATEGORIES } from "../models/EmergencyIncident.js";
import { classify } from "../controllers/aiController.js";

const router = Router();
router.post("/classify", protect, [
  body("description").trim().isLength({ min: 5, max: 1000 }).withMessage("Describe the emergency in 5-1000 characters."),
  body("category").optional().isIn(CATEGORIES),
], validate, classify);

export default router;
