import { asyncHandler } from '../utils/async-handler.js';
import { SubmitAttempt } from '../application/submission/submit-attempt.use-case.js';
import { MongoAttemptRepository } from '../infrastructure/repositories/mongo-attempt.repository.js';
import { MongoSubmissionRepository } from '../infrastructure/repositories/mongo-submission.repository.js';

const submitAttemptUseCase = new SubmitAttempt(
  new MongoAttemptRepository(),
  new MongoSubmissionRepository(),
);

export const submitAttempt = asyncHandler(async (req, res) => {
  const result = await submitAttemptUseCase.execute(req.auth.sub, req.params.attemptId);

  res.status(201).json({
    success: true,
    data: {
      submission: result.submission,
      attemptStatus: result.attemptStatus,
    },
  });
});
