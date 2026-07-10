import { Router } from "express";

import CommentController from "./comment.controller.js";

import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";

import {
  createCommentValidation,
  updateCommentValidation,
  commentIdValidation,
  getCommentsValidation,
} from "./comment.validation.js";

const commentRouter = Router();

commentRouter.use(authMiddleware);

commentRouter.get(
  "/:id",
  getCommentsValidation,
  validationMiddleware,
  CommentController.getComments,
);

commentRouter.post(
  "/:id",
  getCommentsValidation,
  createCommentValidation,
  validationMiddleware,
  CommentController.createComment,
);

commentRouter.put(
  "/:id",
  commentIdValidation,
  updateCommentValidation,
  validationMiddleware,
  CommentController.updateComment,
);

commentRouter.delete(
  "/:id",
  commentIdValidation,
  validationMiddleware,
  CommentController.deleteComment,
);

export default commentRouter;
