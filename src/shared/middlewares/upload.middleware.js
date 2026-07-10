import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import BadRequestError from "../errors/bad-request-error.js";

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/posts");
  },

  filename(req, file, cb) {
    const extension = path.extname(file.originalname);

    cb(null, `${randomUUID()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new BadRequestError("Only JPEG, PNG, and WebP images are allowed"),
    );
  }

  return cb(null, true);
};
const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default uploadMiddleware;
