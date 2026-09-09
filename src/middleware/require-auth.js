import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

export function requireAuth(req, _res, next) {
  try {
    const token = req.cookies.session;
    if (!token) throw new AppError(401, 'Authentication required');
    req.auth = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError(401, 'Invalid or expired session'));
  }
}
