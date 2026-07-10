import { param } from "express-validator";

export const postIdValidation = [
  param("id").isUUID().withMessage("Post ID must be a valid UUID"),
];
