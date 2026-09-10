import { asyncHandler } from '../utils/async-handler.js';
import { EvaluateSubmission } from '../application/evaluation/evaluate-submission.use-case.js';
import { ListProblemEvaluations } from '../application/evaluation/list-problem-evaluations.use-case.js';
import { ListUserEvaluations } from '../application/evaluation/list-user-evaluations.use-case.js';
import { Submission } from '../models/submission.model.js';
import { Problem } from '../models/problem.model.js';
import { MongoSubmissionRepository } from '../infrastructure/repositories/mongo-submission.repository.js';
import { MongoEvaluationRepository } from '../infrastructure/repositories/mongo-evaluation.repository.js';
import { createEvaluator } from '../infrastructure/ai/create-evaluator.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

class ProblemRepository {
  async findById(problemId) {
    return Problem.findOne({ slug: problemId }).lean();
  }

  async findBySlugs(slugs) {
    return Problem.find({ slug: { $in: slugs } }).lean();
  }
}

const evaluationRepository = new MongoEvaluationRepository();
const submissionRepository = new MongoSubmissionRepository();
const evaluateSubmissionUseCase = new EvaluateSubmission({
  submissionRepository,
  evaluationRepository,
  problemRepository: new ProblemRepository(),
  evaluator: createEvaluator(env),
});
const listProblemEvaluationsUseCase = new ListProblemEvaluations(submissionRepository, evaluationRepository);
const listUserEvaluationsUseCase = new ListUserEvaluations({ submissionRepository, evaluationRepository, problemRepository: new ProblemRepository() });

export const evaluateSubmission = asyncHandler(async (req, res) => {
  const evaluation = await evaluateSubmissionUseCase.execute(req.auth.sub, req.params.submissionId);
  res.status(200).json({ success: true, data: { evaluation } });
});

export const getSubmissionEvaluation = asyncHandler(async (req, res) => {
  const submission = await submissionRepository.findById(req.params.submissionId);
  if (!submission) throw new AppError(404, 'Submission not found', { code: 'SUBMISSION_NOT_FOUND' });
  if (submission.userId.toString() !== req.auth.sub.toString()) throw new AppError(403, 'Submission belongs to another user', { code: 'SUBMISSION_FORBIDDEN' });

  const evaluation = await evaluationRepository.findBySubmissionId(req.params.submissionId);
  if (!evaluation) throw new AppError(404, 'Evaluation not found', { code: 'EVALUATION_NOT_FOUND' });
  res.status(200).json({ success: true, data: { evaluation } });
});

export const getAttemptEvaluation = asyncHandler(async (req, res) => {
  const submission = await submissionRepository.findByAttemptId(req.params.attemptId);
  if (!submission) throw new AppError(404, 'Submission not found for this attempt', { code: 'SUBMISSION_NOT_FOUND' });
  if (submission.userId.toString() !== req.auth.sub.toString()) throw new AppError(403, 'Attempt belongs to another user', { code: 'ATTEMPT_FORBIDDEN' });

  const evaluation = await evaluationRepository.findBySubmissionId(submission._id || submission.id);
  if (!evaluation) throw new AppError(404, 'Evaluation not found', { code: 'EVALUATION_NOT_FOUND' });
  res.status(200).json({ success: true, data: { evaluation } });
});

export const listProblemEvaluations = asyncHandler(async (req, res) => {
  const history = await listProblemEvaluationsUseCase.execute(req.auth.sub, req.params.problemId);
  res.status(200).json({ success: true, data: { problemId: req.params.problemId, history } });
});

export const listUserEvaluations = asyncHandler(async (req, res) => {
  const dashboard = await listUserEvaluationsUseCase.execute(req.auth.sub);
  res.status(200).json({ success: true, data: dashboard });
});
