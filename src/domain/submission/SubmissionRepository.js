/**
 * Repository contract for immutable submission snapshots.
 */
export class SubmissionRepository {
  async create(_submission) {
    throw new Error('Not implemented');
  }

  async findById(_submissionId) {
    throw new Error('Not implemented');
  }

  async findByAttemptId(_attemptId) {
    throw new Error('Not implemented');
  }

  async findByUserAndProblem(_userId, _problemId) {
    throw new Error('Not implemented');
  }

  async findByUser(_userId) {
    throw new Error('Not implemented');
  }
}
