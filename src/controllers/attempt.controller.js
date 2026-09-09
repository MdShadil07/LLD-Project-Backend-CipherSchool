import { asyncHandler } from '../utils/async-handler.js';
import { StartAttempt } from '../application/attempt/start-attempt.use-case.js';
import { GetAttempt } from '../application/attempt/get-attempt.use-case.js';
import { SaveDraft } from '../application/attempt/save-draft.use-case.js';
import { ListAttempts } from '../application/attempt/list-attempts.use-case.js';
import { MongoAttemptRepository } from '../infrastructure/repositories/mongo-attempt.repository.js';
import { Problem } from '../models/problem.model.js'; // Using raw Mongoose Model for now, ideally behind a ProblemRepository

// We quickly create a minimal ProblemRepository wrapper for the use cases
class MinimalMongoProblemRepository {
  async findById(problemId) {
    // Our problem schema uses 'slug' as the primary ID conceptually, 
    // but in MongoDB it might be _id. Let's assume the user passes the slug as problemId based on URLs.
    return Problem.findOne({ slug: problemId }).lean();
  }
}

const attemptRepository = new MongoAttemptRepository();
const problemRepository = new MinimalMongoProblemRepository();

const startAttemptUseCase = new StartAttempt(problemRepository, attemptRepository);
const getAttemptUseCase = new GetAttempt(attemptRepository);
const saveDraftUseCase = new SaveDraft(attemptRepository);
const listAttemptsUseCase = new ListAttempts(attemptRepository);

export const listAttempts = asyncHandler(async (req, res) => {
  const userId = req.auth.sub;
  const attempts = await listAttemptsUseCase.execute(userId);
  res.status(200).json({ success: true, attempts });
});

export const startAttempt = asyncHandler(async (req, res) => {
  const userId = req.auth.sub;
  const problemId = req.params.problemId; // e.g., 'parking-lot'

  const attempt = await startAttemptUseCase.execute(userId, problemId);

  res.status(201).json({
    success: true,
    attempt
  });
});

export const getAttempt = asyncHandler(async (req, res) => {
  const userId = req.auth.sub;
  const attemptId = req.params.attemptId;

  const attempt = await getAttemptUseCase.execute(userId, attemptId);

  res.status(200).json({
    success: true,
    attempt
  });
});

export const saveDraft = asyncHandler(async (req, res) => {
  const userId = req.auth.sub;
  const attemptId = req.params.attemptId;
  const draftUpdates = req.body.draft || req.body; // allow partial draft
  const timeSpentSeconds = req.body.timeSpentSeconds;

  const attempt = await saveDraftUseCase.execute(userId, attemptId, draftUpdates, timeSpentSeconds);

  res.status(200).json({
    success: true,
    attempt
  });
});
