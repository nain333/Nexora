import { body, param, query, checkExact } from "express-validator";

export const createCommentValidation = [
  body("content")
    .exists({ values: "falsy" })
    .withMessage("Comment content is required")
    .bail()
    .isString()
    .withMessage("Comment content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Comment content cannot be empty"),

  checkExact(),
];

export const updateCommentValidation = [
  body("content")
    .exists({ values: "falsy" })
    .withMessage("Comment content is required")
    .bail()
    .isString()
    .withMessage("Comment content must be a string")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Comment content cannot be empty"),

  checkExact(),
];

export const commentIdValidation = [
  param("id").isUUID().withMessage("Comment ID must be a valid UUID"),
];

export const getCommentsValidation = [
  param("id").isUUID().withMessage("Post ID must be a valid UUID"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100")
    .toInt(),
];
