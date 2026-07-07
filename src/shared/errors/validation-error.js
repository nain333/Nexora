import AppError from "./app-error.js";

export default class ValidationError extends AppError {
    constructor(
        message = "Request validation failed",
        errors = []
    ) {
        super(message, 400);

        this.errors = errors;
    }
}