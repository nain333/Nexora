import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/posts");
    },

    filename(req, file, cb) {
        const extension = path.extname(file.originalname);

        cb(null, `${randomUUID()}${extension}`);
    },
});

const uploadMiddleware = multer({
    storage,
});

export default uploadMiddleware;