import * as authService from '../services/auth.service.js';
import { clearAuthCookie, createToken, setAuthCookie } from '../utils/auth-cookie.js';
import { asyncHandler } from '../utils/async-handler.js';

function establishSession(res, user, statusCode) {
  const token = createToken(user.id);
  setAuthCookie(res, token);
  // Also return token in body so cross-origin clients can use Bearer auth
  return res.status(statusCode).json({ user, token });
}

export const signup = asyncHandler(async (req, res) => establishSession(res, await authService.signup(req.body), 201));
export const login = asyncHandler(async (req, res) => establishSession(res, await authService.login(req.body), 200));
export const me = asyncHandler(async (req, res) => res.json({ user: await authService.getUserById(req.auth.sub) }));
export function logout(_req, res) { clearAuthCookie(res); res.status(204).send(); }
