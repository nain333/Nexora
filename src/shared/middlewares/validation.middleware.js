import { validationResult } from "express-validator";

import ValidationError from "../errors/validation-error.js";

export default function validationMiddleware(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((error) => ({
            field: error.path,
            message: error.msg,
        }));

        throw new ValidationError(
            "Request validation failed",
            validationErrors
        );
    }

    return next();
}