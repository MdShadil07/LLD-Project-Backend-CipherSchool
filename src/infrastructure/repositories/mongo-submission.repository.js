import { Submission } from '../../models/submission.model.js';
import { SubmissionRepository } from '../../domain/submission/SubmissionRepository.js';

export class MongoSubmissionRepository extends SubmissionRepository {
  async create(submissionData) {
    const submission = new Submission(submissionData);
    await submission.save();
    return submission.toObject({ virtuals: true });
  }

  async findById(submissionId) {
    return Submission.findById(submissionId).lean({ virtuals: true });
  }

  async findByAttemptId(attemptId) {
    return Submission.findOne({ attemptId }).sort({ version: -1 }).lean({ virtuals: true });
  }

  async findByUserAndProblem(userId, problemId) {
    return Submission.find({ userId, problemId }).sort({ submittedAt: -1 }).lean({ virtuals: true });
  }

  async findByUser(userId) {
    return Submission.find({ userId }).sort({ submittedAt: -1 }).lean({ virtuals: true });
  }
}
