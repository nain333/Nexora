import AppError from "./app-error.js";

export default class UnauthorizedError extends AppError {
    constructor(message = "Authentication required") {
        super(message, 401);
    }
}