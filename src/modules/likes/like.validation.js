import { param } from "express-validator";

export const postIdValidation = [
  param("postId").isUUID().withMessage("Post ID must be a valid UUID"),
];
