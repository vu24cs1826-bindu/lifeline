import { Router } from "express";
import { body } from "express-validator";
import { register, login, getMe, updateMe, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { SKILLS } from "../models/ResponderProfile.js";

const router = Router();
// "admin" is never allowed here. Admins are created only by the seed script.
const SELF_ROLES = ["citizen", "volunteer", "medical_responder", "organization"];

router.post("/register", [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters."),
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").isLength({ min: 8, max: 72 }).withMessage("Password must be 8-72 characters."),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 20 }).withMessage("Phone is too long."),
  body("role").optional().isIn(SELF_ROLES).withMessage("Invalid role."),
  body("skills").optional().isArray({ max: 8 }).withMessage("Skills must be a list."),
  body("skills.*").optional().isIn(SKILLS).withMessage("Unknown skill."),
  body("qualification").optional({ values: "falsy" }).trim().isLength({ max: 200 }),
  body("organizationName").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
], validate, register);

router.post("/login", [body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(), body("password").notEmpty().withMessage("Password is required.")], validate, login);
router.get("/me", protect, getMe);
router.patch("/me", protect, [
  body("name").optional().trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters."),
  body("phone").optional({ values: "falsy" }).trim().isLength({ max: 20 }),
], validate, updateMe);
router.patch("/me/password", protect, [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 8, max: 72 }).withMessage("New password must be 8-72 characters."),
], validate, changePassword);

export default router;
