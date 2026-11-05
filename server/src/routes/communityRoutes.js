import { Router } from "express";
import { body, param } from "express-validator";
import { protect, authorize } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import upload from "../middleware/upload.js";
import { REPORT_CATEGORIES } from "../models/CommunityReport.js";
import * as c from "../controllers/communityController.js";

const router = Router();
router.use(protect);

router.get("/", c.listVerified);
router.get("/mine", c.listMine);
router.post("/", upload.array("images", 3), [
  body("category").isIn(REPORT_CATEGORIES).withMessage("Choose a category."),
  body("title").trim().isLength({ min: 3, max: 100 }).withMessage("Title must be 3-100 characters."),
  body("description").trim().isLength({ min: 10, max: 800 }).withMessage("Description must be 10-800 characters."),
  body("address").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("lat").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required."),
  body("lng").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required."),
], validate, c.createReport);

router.get("/moderation", authorize("admin"), c.listForModeration);
router.patch("/:id/moderate", authorize("admin"), param("id").isMongoId(), [
  body("status").isIn(["verified", "rejected", "resolved"]).withMessage("Invalid status."),
  body("note").optional().trim().isLength({ max: 300 }),
], validate, c.moderate);

export default router;
