import { GetDashboard } from '../application/dashboard/get-dashboard.use-case.js';
import { MongoAttemptRepository } from '../infrastructure/repositories/mongo-attempt.repository.js';
import { MongoSubmissionRepository } from '../infrastructure/repositories/mongo-submission.repository.js';
import { MongoEvaluationRepository } from '../infrastructure/repositories/mongo-evaluation.repository.js';
import { Problem } from '../models/problem.model.js';
import { asyncHandler } from '../utils/async-handler.js';

class ProblemRepository {
  async findBySlugs(slugs) {
    return Problem.find({ slug: { $in: slugs } }).lean();
  }
}

const getDashboardUseCase = new GetDashboard({
  attemptRepository: new MongoAttemptRepository(),
  submissionRepository: new MongoSubmissionRepository(),
  evaluationRepository: new MongoEvaluationRepository(),
  problemRepository: new ProblemRepository(),
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getDashboardUseCase.execute(req.auth.sub);
  res.status(200).json({ success: true, data: dashboard });
});
