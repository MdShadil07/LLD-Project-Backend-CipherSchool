import { AppError } from '../../utils/app-error.js';

export class ListAttempts {
  constructor(attemptRepository) {
    this.attemptRepository = attemptRepository;
  }

  async execute(userId) {
    return this.attemptRepository.findByUser(userId);
  }
}
