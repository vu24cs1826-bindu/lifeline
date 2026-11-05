import { Router } from "express";
import { body, param } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import * as c from "../controllers/adminController.js";
import { overview } from "../controllers/analyticsController.js";

const router = Router();
router.use(protect, authorize("admin"));
const id = param("id").isMongoId().withMessage("Invalid ID.");

router.get("/stats", c.stats);
router.get("/analytics", overview);
router.get("/map", c.mapIncidents);
router.get("/users", c.listUsers);
router.patch("/users/:id/verification", id, [body("status").isIn(["verified", "rejected"]), body("note").optional().trim().isLength({ max: 300 })], validate, c.setVerification);
router.patch("/users/:id/suspension", id, [body("suspend").isBoolean(), body("reason").optional().trim().isLength({ max: 300 })], validate, c.setSuspension);
router.get("/organizations", c.listOrganizations);
router.patch("/organizations/:id", id, [body("status").isIn(["pending", "verified", "rejected", "suspended"])], validate, c.setOrganizationStatus);
router.get("/audit-logs", c.auditLogs);

export default router;
