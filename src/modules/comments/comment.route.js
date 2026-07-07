import { Router } from "express";

import CommentController from "./comment.controller.js";
import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";
import {
    createCommentValidation,
    updateCommentValidation,
} from "./comment.validation.js";

const commentRouter = Router();

commentRouter.use(authMiddleware);

commentRouter.get("/:id", CommentController.getComments);

commentRouter.post(
    "/:id",
    createCommentValidation,
    validationMiddleware,
    CommentController.createComment
);

commentRouter.put(
    "/:id",
    updateCommentValidation,
    validationMiddleware,
    CommentController.updateComment
);

commentRouter.delete("/:id", CommentController.deleteComment);

export default commentRouter;