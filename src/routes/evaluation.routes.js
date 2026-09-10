import { Router } from 'express';
import { requireAuth } from '../middleware/require-auth.js';
import { evaluateSubmission, getAttemptEvaluation, getSubmissionEvaluation, listProblemEvaluations, listUserEvaluations } from '../controllers/evaluation.controller.js';

export const evaluationRouter = Router();

evaluationRouter.use(requireAuth);
evaluationRouter.post('/submissions/:submissionId/evaluate', evaluateSubmission);
evaluationRouter.get('/submissions/:submissionId/evaluation', getSubmissionEvaluation);
evaluationRouter.get('/attempts/:attemptId/evaluation', getAttemptEvaluation);
evaluationRouter.get('/problems/:problemId/evaluations', listProblemEvaluations);
evaluationRouter.get('/evaluations', listUserEvaluations);
