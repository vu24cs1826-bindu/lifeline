import { Router } from "express";
import { body } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import * as c from "../controllers/responderController.js";

const router = Router();
router.use(protect, authorize("volunteer", "medical_responder", "organization"));

router.get("/me", c.getMyProfile);
router.patch("/me", [body("skills").optional().isArray({ max: 8 }), body("qualification").optional().trim().isLength({ max: 200 })], validate, c.updateMyProfile);
router.patch("/me/availability", [body("available").isBoolean().withMessage("available must be true or false.")], validate, c.setAvailability);
router.patch("/me/location", [body("lat").isFloat({ min: -90, max: 90 }), body("lng").isFloat({ min: -180, max: 180 })], validate, c.setLocation);

export default router;
