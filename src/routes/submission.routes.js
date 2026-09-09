import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.js';
import { submitAttempt } from '../controllers/submission.controller.js';

export const submissionRouter = Router();

submissionRouter.use(requireAuth);
submissionRouter.post('/attempts/:attemptId/submit', submitAttempt);
