import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as c from "../controllers/notificationController.js";

const router = Router();
router.use(protect);
router.get("/", c.list);
router.patch("/read-all", c.markAllRead);
router.patch("/:id/read", c.markRead);

export default router;
