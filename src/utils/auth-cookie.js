import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export function createToken(userId) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function setAuthCookie(res, token) {
  res.cookie('session', token, cookieOptions);
}

export function clearAuthCookie(res) {
  res.clearCookie('session', { ...cookieOptions, maxAge: undefined });
}
