import { Router } from "express";

import PostController from "./post.controller.js";
import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import uploadMiddleware from "../../shared/middlewares/upload.middleware.js";

const postRouter = Router();

postRouter.use(authMiddleware);

postRouter.get("/all", PostController.getAllPosts);
postRouter.get("/", PostController.getUserPosts);
postRouter.get("/:id", PostController.getPostById);

postRouter.post(
  "/",
  uploadMiddleware.single("image"),
  PostController.createPost,
);

postRouter.put(
  "/:id",
  uploadMiddleware.single("image"),
  PostController.updatePost,
);
postRouter.delete("/:id", PostController.deletePost);

export default postRouter;
