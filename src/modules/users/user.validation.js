import { body } from "express-validator";

export const registerValidation = [
    body("name")
        .exists({ values: "falsy" })
        .withMessage("Name is required")
        .bail()
        .isString()
        .withMessage("Name must be a string")
        .bail()
        .trim()
        .notEmpty()
        .withMessage("Name cannot be empty"),

    body("email")
        .exists({ values: "falsy" })
        .withMessage("Email is required")
        .bail()
        .isString()
        .withMessage("Email must be a string")
        .bail()
        .trim()
        .isEmail()
        .withMessage("A valid email address is required")
        .normalizeEmail(),

    body("password")
        .exists({ values: "falsy" })
        .withMessage("Password is required")
        .bail()
        .isString()
        .withMessage("Password must be a string")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
];

export const loginValidation = [
    body("email")
        .exists({ values: "falsy" })
        .withMessage("Email is required")
        .bail()
        .isString()
        .withMessage("Email must be a string")
        .bail()
        .trim()
        .isEmail()
        .withMessage("A valid email address is required")
        .normalizeEmail(),

    body("password")
        .exists({ values: "falsy" })
        .withMessage("Password is required")
        .bail()
        .isString()
        .withMessage("Password must be a string"),
];