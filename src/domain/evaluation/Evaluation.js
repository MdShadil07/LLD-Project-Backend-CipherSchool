export const EVALUATION_STATUS = Object.freeze({
  EVALUATING: 'EVALUATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

export const EVALUATOR_TYPES = Object.freeze({
  DETERMINISTIC: 'DETERMINISTIC',
  AI: 'AI',
});

export class Evaluation {
  constructor({
    id,
    submissionId,
    attemptId,
    evaluatorType,
    evaluatorVersion,
    rubricVersion,
    status = EVALUATION_STATUS.EVALUATING,
    criteria = [],
    overallScore = null,
    overallSummary = '',
    topImprovements = [],
    overallConfidence = null,
    error = null,
    startedAt,
    completedAt,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.submissionId = submissionId;
    this.attemptId = attemptId;
    this.evaluatorType = evaluatorType;
    this.evaluatorVersion = evaluatorVersion;
    this.rubricVersion = rubricVersion;
    this.status = status;
    this.criteria = criteria;
    this.overallScore = overallScore;
    this.overallSummary = overallSummary;
    this.topImprovements = topImprovements;
    this.overallConfidence = overallConfidence;
    this.error = error;
    this.startedAt = startedAt;
    this.completedAt = completedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
