import { body,param,query } from "express-validator";

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
export const postIdValidation = [
    param("id")
        .isUUID()
        .withMessage("Post ID must be a valid UUID"),
];

export const getAllPostsValidation = [
    query("caption")
        .optional()
        .isString()
        .withMessage("Caption filter must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Caption filter cannot be empty"),

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

export const postStatusValidation = [
    body("status")
        .exists({ values: "falsy" })
        .withMessage("Post status is required")
        .bail()
        .isIn(["published", "draft", "archived"])
        .withMessage(
            "Post status must be published, draft, or archived"
        ),
];