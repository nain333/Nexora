import NotFoundError from "../errors/not-found-error.js";

export default function notFoundHandler(req, res, next) {
    next(
        new NotFoundError(
            `Cannot ${req.method} ${req.originalUrl}`
        )
    );
}