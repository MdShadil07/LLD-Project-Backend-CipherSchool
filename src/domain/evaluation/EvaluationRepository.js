/**
 * Repository contract for persisted evaluation lifecycle records.
 */
export class EvaluationRepository {
  async create(_evaluation) {
    throw new Error('Not implemented');
  }

  async findById(_evaluationId) {
    throw new Error('Not implemented');
  }

  async findBySubmissionId(_submissionId) {
    throw new Error('Not implemented');
  }

  async update(_evaluationId, _changes) {
    throw new Error('Not implemented');
  }

  async findBySubmissionIds(_submissionIds) {
    throw new Error('Not implemented');
  }
}
