import { Router } from "express";

import PostController from "./post.controller.js";

import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import uploadMiddleware from "../../shared/middlewares/upload.middleware.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";

import {
  createPostValidation,
  updatePostValidation,
  postIdValidation,
  getAllPostsValidation,
  postStatusValidation,
} from "./post.validation.js";

const postRouter = Router();

postRouter.use(authMiddleware);

postRouter.get(
  "/all",
  getAllPostsValidation,
  validationMiddleware,
  PostController.getAllPosts,
);

postRouter.get("/", PostController.getUserPosts);
postRouter.patch(
  "/:id/status",
  postIdValidation,
  postStatusValidation,
  validationMiddleware,
  PostController.updatePostStatus,
);

postRouter.get(
  "/:id",
  postIdValidation,
  validationMiddleware,
  PostController.getPostById,
);

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
  postIdValidation,
  updatePostValidation,
  validationMiddleware,
  PostController.updatePost,
);

postRouter.delete(
  "/:id",
  postIdValidation,
  validationMiddleware,
  PostController.deletePost,
);

export default postRouter;