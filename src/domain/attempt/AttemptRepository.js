/**
 * AttemptRepository Interface (Conceptual)
 * 
 * Since this is plain JavaScript, this class serves as documentation
 * of the contract that infrastructure implementations must fulfill.
 */
export class AttemptRepository {
  /**
   * @param {Object} attempt
   * @returns {Promise<Object>}
   */
  async create(attempt) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} attemptId
   * @returns {Promise<Object|null>}
   */
  async findById(attemptId) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} userId
   * @param {string} problemId
   * @returns {Promise<Object|null>}
   */
  async findDraftByUserAndProblem(userId, problemId) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} attemptId
   * @param {Object} draft
   * @param {number} timeSpentSeconds
   * @returns {Promise<Object>}
   */
  async updateDraft(attemptId, draft, timeSpentSeconds) {
    throw new Error('Not implemented');
  }

  /**
   * Transition a draft attempt to a terminal status only if it is still editable.
   * @param {string} attemptId
   * @param {string} status
   * @returns {Promise<Object|null>}
   */
  async markSubmitted(attemptId, status) {
    throw new Error('Not implemented');
  }
}
