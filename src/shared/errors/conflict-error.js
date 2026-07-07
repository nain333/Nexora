import AppError from "./app-error.js";

export default class ConflictError extends AppError {
    constructor(message = "Resource conflict") {
        super(message, 409);
    }
}