import { AppError } from '../../utils/app-error.js';

export class GetAttempt {
  constructor(attemptRepository) {
    this.attemptRepository = attemptRepository;
  }

  async execute(userId, attemptId) {
    const attempt = await this.attemptRepository.findById(attemptId);
    
    if (!attempt) {
      throw new AppError(404, 'Attempt not found');
    }

    // Ensure the attempt belongs to the requesting user
    if (attempt.userId.toString() !== userId.toString()) {
      throw new AppError(403, 'Attempt belongs to another user');
    }

    return attempt;
  }
}
