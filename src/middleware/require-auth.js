import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function requireAuth(req, _res, next) {
  try {
    // Accept token from cookie (same-origin / local dev) OR
    // Authorization: Bearer <token> header (cross-origin production)
    const fromCookie = req.cookies?.session;
    const fromHeader = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null;
    const token = fromCookie || fromHeader;
    if (!token) throw new AppError(401, 'Authentication required');
    req.auth = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired session'));
  }
}

