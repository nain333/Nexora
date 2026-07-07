import AppError from "./app-error.js";

export default class BadRequestError extends AppError {
    constructor(message = "Bad request") {
        super(message, 400);
    }
}