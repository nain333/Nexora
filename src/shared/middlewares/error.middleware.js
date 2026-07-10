import multer from "multer";

export default function errorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }

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