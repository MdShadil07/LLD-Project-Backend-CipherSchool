import { AppError } from '../../utils/app-error.js';

const REQUIRED_FIELDS = ['requirements', 'assumptions', 'entities', 'relationships', 'flow', 'tradeoffs'];

function missingFields(draft = {}) {
  return REQUIRED_FIELDS.filter((field) => typeof draft[field] !== 'string' || draft[field].trim().length < 12);
}

export class SubmitAttempt {
  constructor(attemptRepository, submissionRepository) {
    this.attemptRepository = attemptRepository;
    this.submissionRepository = submissionRepository;
  }

  async execute(userId, attemptId) {
    const attempt = await this.attemptRepository.findById(attemptId);

    if (!attempt) {
      throw new AppError(404, 'Attempt not found', { code: 'ATTEMPT_NOT_FOUND' });
    }

    if (attempt.userId.toString() !== userId.toString()) {
      throw new AppError(403, 'Attempt belongs to another user', { code: 'ATTEMPT_FORBIDDEN' });
    }

    if (attempt.status !== 'DRAFT') {
      throw new AppError(409, 'This attempt has already been submitted.', { code: 'ATTEMPT_ALREADY_SUBMITTED' });
    }

    const fields = missingFields(attempt.draft);
    if (fields.length > 0) {
      throw new AppError(400, 'Complete all required sections before submitting.', {
        code: 'SUBMISSION_INCOMPLETE',
        fields,
      });
    }

    const existingSubmission = await this.submissionRepository.findByAttemptId(attemptId);
    if (existingSubmission) {
      throw new AppError(409, 'This attempt has already been submitted.', { code: 'DUPLICATE_SUBMISSION' });
    }

    const submission = await this.submissionRepository.create({
      attemptId,
      userId: attempt.userId,
      problemId: attempt.problemId,
      version: 1,
      format: 'STRUCTURED_DESIGN',
      content: { ...attempt.draft },
      submittedAt: new Date(),
    });

    const submittedAttempt = await this.attemptRepository.markSubmitted(attemptId, 'SUBMITTED');
    if (!submittedAttempt) {
      throw new AppError(409, 'The attempt changed before it could be submitted.', { code: 'SUBMISSION_STATE_CONFLICT' });
    }

    return { submission, attemptStatus: submittedAttempt.status };
  }
}
