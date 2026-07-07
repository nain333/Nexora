import { body } from "express-validator";

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
];