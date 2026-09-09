import { Attempt } from '../../models/attempt.model.js';
import { AttemptRepository } from '../../domain/attempt/AttemptRepository.js';

export class MongoAttemptRepository extends AttemptRepository {
  async create(attemptData) {
    const attempt = new Attempt(attemptData);
    await attempt.save();
    return attempt.toObject({ virtuals: true });
  }

  async findById(attemptId) {
    return Attempt.findById(attemptId).lean({ virtuals: true });
  }

  async findDraftByUserAndProblem(userId, problemId) {
    return Attempt.findOne({ userId, problemId, status: 'DRAFT' }).lean({ virtuals: true });
  }

  async findByUser(userId) {
    return Attempt.find({ userId }).sort({ updatedAt: -1 }).lean({ virtuals: true });
  }

  async updateDraft(attemptId, draft, timeSpentSeconds) {
    return Attempt.findOneAndUpdate(
      { _id: attemptId, status: 'DRAFT' },
      {
        $set: { draft, timeSpentSeconds, lastSavedAt: new Date() },
      },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
  }

  async markSubmitted(attemptId, status) {
    return Attempt.findOneAndUpdate(
      { _id: attemptId, status: 'DRAFT' },
      {
        $set: { status, lastSavedAt: new Date() },
      },
      { new: true, runValidators: true }
    ).lean({ virtuals: true });
  }
}
