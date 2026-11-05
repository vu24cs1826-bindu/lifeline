import multer from "multer";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import ApiError from "../utils/ApiError.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

export default multer({
  storage: multer.diskStorage({
    destination: dir,
    filename: (req, file, cb) => cb(null, crypto.randomBytes(12).toString("hex") + ALLOWED[file.mimetype]),
  }),
  limits: { fileSize: 3 * 1024 * 1024, files: 3 },
  fileFilter: (req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(new ApiError(400, "Only JPG, PNG or WEBP images up to 3 MB are allowed.")),
});
