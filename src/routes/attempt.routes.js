import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.js';
import { startAttempt, getAttempt, saveDraft, listAttempts } from '../controllers/attempt.controller.js';

const router = Router();

// Ensure all attempt routes are protected
router.use(requireAuth);

// Note: This route is conceptually under /api/v1/problems/:problemId/attempts,
// but for simpler routing structure, we can mount it globally on /api/v1/attempts
// or mount it specifically. Let's provide both here to match the spec exactly:

// GET /attempts
router.get('/', listAttempts);

// GET /attempts/:attemptId
router.get('/:attemptId', getAttempt);

// PATCH /attempts/:attemptId/draft
router.patch('/:attemptId/draft', saveDraft);

export default router;
