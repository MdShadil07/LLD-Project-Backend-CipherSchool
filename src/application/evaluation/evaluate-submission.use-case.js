import { AppError } from '../../utils/app-error.js';
import { EVALUATION_STATUS } from '../../domain/evaluation/Evaluation.js';
import {
  calculateWeightedScore,
  normalizeEvaluationResult,
  validateEvaluationResult,
  validateRubric,
  validateSubmissionForEvaluation,
} from './evaluation.validation.js';

export class EvaluateSubmission {
  constructor({ submissionRepository, evaluationRepository, problemRepository, evaluator }) {
    this.submissionRepository = submissionRepository;
    this.evaluationRepository = evaluationRepository;
    this.problemRepository = problemRepository;
    this.evaluator = evaluator;
  }

  async execute(userId, submissionId) {
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) throw new AppError(404, 'Submission not found', { code: 'SUBMISSION_NOT_FOUND' });
    if (submission.userId.toString() !== userId.toString()) throw new AppError(403, 'Submission belongs to another user', { code: 'SUBMISSION_FORBIDDEN' });

    const existing = await this.evaluationRepository.findBySubmissionId(submissionId);
    if (existing?.status === EVALUATION_STATUS.COMPLETED || existing?.status === EVALUATION_STATUS.EVALUATING) return existing;

    const problem = await this.problemRepository.findById(submission.problemId);
    if (!problem) throw new AppError(404, 'Problem not found', { code: 'PROBLEM_NOT_FOUND' });

    const rubric = {
      version: problem.rubricVersion || 'v1',
      criteria: problem.rubric.map((criterion) => ({
        id: criterion.id || criterion.criterion.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        name: criterion.criterion,
        description: criterion.description,
        weight: criterion.weight,
      })),
    };

    validateSubmissionForEvaluation(submission);
    validateRubric(rubric);

    const evaluation = existing?.status === EVALUATION_STATUS.FAILED
      ? await this.evaluationRepository.update(existing._id || existing.id, {
        status: EVALUATION_STATUS.EVALUATING,
        error: null,
        criteria: [],
        overallScore: null,
        overallSummary: '',
        topImprovements: [],
        overallConfidence: null,
        startedAt: new Date(),
        completedAt: null,
      })
      : await this.evaluationRepository.create({
      submissionId,
      attemptId: submission.attemptId,
      userId: submission.userId,
      evaluatorType: this.evaluator.type,
      evaluatorVersion: this.evaluator.version,
      model: this.evaluator.modelName ?? null,
      rubricVersion: rubric.version,
      status: EVALUATION_STATUS.EVALUATING,
      startedAt: new Date(),
    });

    let rawResult;
    try {
      rawResult = await this.evaluator.evaluate(problem, submission, rubric);
      const result = normalizeEvaluationResult(rawResult, rubric);
      validateEvaluationResult(result, rubric);
      const completed = await this.evaluationRepository.update(evaluation._id || evaluation.id, {
        status: EVALUATION_STATUS.COMPLETED,
        criteria: result.criteria.map((criterion) => ({
          ...criterion,
          // Weight belongs to the versioned problem rubric, never to the AI response.
          weight: rubric.criteria.find((rubricCriterion) => rubricCriterion.id === criterion.criterionId).weight,
        })),
        overallScore: calculateWeightedScore(result.criteria, rubric),
        overallSummary: result.overallSummary,
        topImprovements: result.topImprovements,
        overallConfidence: result.overallConfidence,
        completedAt: new Date(),
      });
      return completed;
    } catch (error) {
      const failureCode = error.details?.code || (error.code === 'ETIMEDOUT' ? 'EVALUATOR_TIMEOUT' : 'EVALUATOR_FAILED');
      if (failureCode === 'EVALUATOR_INVALID_RESULT') {
        console.warn('Evaluator result rejected by rubric validation.', {
          criteria: Array.isArray(rawResult?.criteria) ? rawResult.criteria.map((criterion) => criterion.criterionId) : undefined,
          criterionConfidences: Array.isArray(rawResult?.criteria) ? rawResult.criteria.map((criterion) => criterion.confidence) : undefined,
          overallConfidence: rawResult?.overallConfidence,
          message: error.message,
        });
      }
      const failureMessage = failureCode === 'EVALUATOR_INVALID_RESULT'
        ? 'The evaluator returned feedback that did not match this problem’s rubric. Please retry.'
        : error instanceof AppError && error.statusCode < 500
        ? error.message
        : 'The evaluator was unavailable or returned an invalid result. Please try again.';
      await this.evaluationRepository.update(evaluation._id || evaluation.id, {
        status: EVALUATION_STATUS.FAILED,
        error: { code: failureCode, message: failureMessage },
        completedAt: new Date(),
      });
      if (error instanceof AppError && error.statusCode < 500) throw error;
      throw new AppError(502, failureMessage, { code: failureCode });
    }
  }
}
