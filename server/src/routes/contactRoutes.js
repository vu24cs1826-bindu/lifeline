import { Router } from "express";
import { body, param } from "express-validator";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import * as c from "../controllers/contactController.js";

const router = Router();
router.use(protect);
const fields = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2-80 characters."),
  body("phone").trim().matches(/^[+()\-\s\d]{7,20}$/).withMessage("Enter a valid phone number."),
  body("relationship").optional({ values: "falsy" }).trim().isLength({ max: 40 }),
  body("isTrusted").optional().isBoolean(),
];
router.get("/", c.listContacts);
router.post("/", fields, validate, c.addContact);
router.patch("/:id", param("id").isMongoId(), fields, validate, c.updateContact);
router.delete("/:id", param("id").isMongoId(), validate, c.deleteContact);

export default router;
