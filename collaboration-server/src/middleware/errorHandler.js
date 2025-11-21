const { ApiError } = require('../utils/errors');

const errorHandler = (err, req, res, next) => {
    let error = err;
    // If the error is not an instance of ApiError, convert it to one.
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode, message, false, err.stack);
    }

    const { statusCode, message } = error;

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
