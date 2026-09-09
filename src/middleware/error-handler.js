import { ZodError } from 'zod';

export function notFound(_req, _res, next) {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  if (error instanceof ZodError) return res.status(400).json({ message: 'Invalid request' });
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'REQUEST_ENTITY_TOO_LARGE',
        message: 'Request body is too large.',
      },
      message: 'Request body is too large.',
    });
  }
  if (error.code === 11000) {
    const message = error.keyPattern?.email ? 'An account with this email already exists' : 'Resource already exists';
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE_RESOURCE', message }, message });
  }
  const status = error.statusCode ?? 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    success: false,
    error: {
      code: error.details?.code || 'REQUEST_FAILED',
      message: error.message || 'Internal server error',
      ...(error.details?.fields && { fields: error.details.fields }),
      ...(error.details?.errors && { errors: error.details.errors }),
      ...(!error.details?.code && !error.details?.fields && !error.details?.errors && error.details && { errors: error.details }),
    },
    message: error.message || 'Internal server error',
  });
}
