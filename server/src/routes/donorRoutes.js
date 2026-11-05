import { Router } from "express";
import { body, param, query } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { BLOOD_GROUPS } from "../models/BloodDonor.js";
import * as c from "../controllers/donorController.js";

const router = Router();
router.use(protect);

router.post("/me", [
  body("bloodGroup").isIn(BLOOD_GROUPS).withMessage("Choose a valid blood group."),
  body("city").trim().isLength({ min: 2, max: 80 }).withMessage("City is required."),
  body("available").optional().isBoolean(),
  body("lat").optional({ values: "falsy" }).isFloat({ min: -90, max: 90 }),
  body("lng").optional({ values: "falsy" }).isFloat({ min: -180, max: 180 }),
  body("lastDonationDate").optional({ values: "falsy" }).isISO8601(),
], validate, c.registerDonor);
router.get("/me", c.getMyDonor);
router.get("/search", [query("bloodGroup").optional().isIn(BLOOD_GROUPS), query("city").optional().trim().isLength({ max: 80 })], validate, c.searchDonors);
router.get("/requests/incoming", c.incomingRequests);
router.get("/requests/outgoing", c.outgoingRequests);
router.patch("/requests/:id", param("id").isMongoId(), [body("accept").isBoolean()], validate, c.respondRequest);
router.post("/:id/request", param("id").isMongoId(), [
  body("hospital").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  body("message").optional({ values: "falsy" }).trim().isLength({ max: 300 }),
  body("urgency").optional().isIn(["normal", "urgent"]),
], validate, c.sendRequest);

export default router;
