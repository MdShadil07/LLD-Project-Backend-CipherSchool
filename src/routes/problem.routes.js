import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler.js';
import { getProblemBySlug, listProblems } from '../controllers/problem.controller.js';
import { startAttempt } from '../controllers/attempt.controller.js';
import { requireAuth } from '../middleware/require-auth.js';

export const problemRouter = Router();

problemRouter.get('/', asyncHandler(listProblems));
problemRouter.get('/:slug', asyncHandler(getProblemBySlug));


problemRouter.post('/:problemId/attempts', requireAuth, startAttempt);
problemRouter.post('/:problemId/practice', requireAuth, startAttempt);

