import { Evaluation } from '../../models/evaluation.model.js';
import { EvaluationRepository } from '../../domain/evaluation/EvaluationRepository.js';

export class MongoEvaluationRepository extends EvaluationRepository {
  async create(evaluationData) {
    const evaluation = new Evaluation(evaluationData);
    await evaluation.save();
    return evaluation.toObject({ virtuals: true });
  }

  async findById(evaluationId) {
    return Evaluation.findById(evaluationId).lean({ virtuals: true });
  }

  async findBySubmissionId(submissionId) {
    return Evaluation.findOne({ submissionId }).lean({ virtuals: true });
  }

  async update(evaluationId, changes) {
    return Evaluation.findByIdAndUpdate(evaluationId, { $set: changes }, { new: true, runValidators: true }).lean({ virtuals: true });
  }

  async findBySubmissionIds(submissionIds) {
    return Evaluation.find({ submissionId: { $in: submissionIds } }).lean({ virtuals: true });
  }
}
