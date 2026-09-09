/**
 * Immutable snapshot of an attempt at submission time.
 * Evaluation should consume this record, never a mutable attempt draft.
 */
export class Submission {
  constructor({ id, attemptId, userId, problemId, version = 1, format = 'STRUCTURED_DESIGN', content, submittedAt, createdAt, updatedAt }) {
    this.id = id;
    this.attemptId = attemptId;
    this.userId = userId;
    this.problemId = problemId;
    this.version = version;
    this.format = format;
    this.content = content;
    this.submittedAt = submittedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
