import { Router } from "express";

import PostController from "./post.controller.js";
import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import uploadMiddleware from "../../shared/middlewares/upload.middleware.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";
import {
  createPostValidation,
  updatePostValidation,
} from "./post.validation.js";

const postRouter = Router();

postRouter.use(authMiddleware);

postRouter.get("/all", PostController.getAllPosts);
postRouter.get("/", PostController.getUserPosts);
postRouter.get("/:id", PostController.getPostById);

postRouter.post(
    "/",
    uploadMiddleware.single("image"),
    createPostValidation,
    validationMiddleware,
    PostController.createPost,
);

postRouter.put(
    "/:id",
    uploadMiddleware.single("image"),
    updatePostValidation,
    validationMiddleware,
    PostController.updatePost,
);
export default postRouter;
