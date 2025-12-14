import ApiError from '../utils/apiError.js';

export const notFound = (req, res, next) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method
    });
  }

  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = ApiError.notFound(message);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value: ${field}. Please use another value`;
    error = ApiError.conflict(message);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => ({
      field: el.path,
      message: el.message
    }));
    const message = 'Validation failed';
    error = ApiError.unprocessableEntity(message, errors);
  }

  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token expired');
  }

  if (!error.statusCode) {
    error.statusCode = 500;
    error.message = error.message || 'Internal Server Error';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });
};