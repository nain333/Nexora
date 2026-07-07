import { body } from "express-validator";

export const createPostValidation = [
    body("caption")
        .exists({ values: "falsy" })
        .withMessage("Post caption is required")
        .bail()
        .isString()
        .withMessage("Post caption must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Post caption cannot be empty"),
];

export const updatePostValidation = [
    body("caption")
        .optional()
        .isString()
        .withMessage("Post caption must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Post caption cannot be empty"),
];