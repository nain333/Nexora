import { Router } from "express";

import BookmarkController from "./bookmark.controller.js";

import authMiddleware from "../../shared/middlewares/auth.middleware.js";
import validationMiddleware from "../../shared/middlewares/validation.middleware.js";

import { postIdValidation } from "./bookmark.validation.js";

const bookmarkRouter = Router();

bookmarkRouter.use(authMiddleware);

bookmarkRouter.get(
  "/",
  BookmarkController.getBookmarks,
);

bookmarkRouter.post(
  "/:id",
  postIdValidation,
  validationMiddleware,
  BookmarkController.createBookmark,
);

bookmarkRouter.delete(
  "/:id",
  postIdValidation,
  validationMiddleware,
  BookmarkController.deleteBookmark,
);

export default bookmarkRouter;