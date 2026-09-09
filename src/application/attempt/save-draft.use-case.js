import { AppError } from '../../utils/app-error.js';

export class SaveDraft {
  constructor(attemptRepository) {
    this.attemptRepository = attemptRepository;
  }

  async execute(userId, attemptId, draftUpdates, timeSpentSeconds) {
    const attempt = await this.attemptRepository.findById(attemptId);
    
    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    if (attempt.userId.toString() !== userId.toString()) {
      throw new AppError(403, 'Attempt belongs to another user');
    }

    if (attempt.status !== 'DRAFT') {
      throw new AppError(409, 'Cannot modify an attempt that is not in DRAFT status');
    }

    // Merge the existing draft with incoming partial updates
    const mergedDraft = {
      ...attempt.draft,
      ...draftUpdates
    };

    const newTimeSpent = typeof timeSpentSeconds === 'number' ? timeSpentSeconds : attempt.timeSpentSeconds;

      const updatedAttempt = await this.attemptRepository.updateDraft(attemptId, mergedDraft, newTimeSpent);
      if (!updatedAttempt) {
        throw new AppError(409, 'Cannot modify an attempt that is not in DRAFT status');
      }

      return updatedAttempt;
  }
}
