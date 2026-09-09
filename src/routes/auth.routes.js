import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/require-auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../validators/auth.validator.js';

export const authRouter = Router();
authRouter.post('/signup', validate(signupSchema), controller.signup);
authRouter.post('/login', validate(loginSchema), controller.login);
authRouter.post('/logout', controller.logout);
authRouter.get('/me', requireAuth, controller.me);
