export default function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const status = err.status || "error";
    const message = err.message || "Internal server error";

    const response = {
        status,
        message,
    };

    if (err.errors) {
        response.errors = err.errors;
    }

    return res.status(statusCode).json(response);
}