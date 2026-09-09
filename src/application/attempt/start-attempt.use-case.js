import { AppError } from '../../utils/app-error.js';

export class StartAttempt {
  constructor(problemRepository, attemptRepository) {
    this.problemRepository = problemRepository;
    this.attemptRepository = attemptRepository;
  }

  async execute(userId, problemId) {
    const problem = await this.problemRepository.findById(problemId);
    
    if (!problem) {
      throw new AppError(404, 'Problem not found');
    }

    // Check if the user already has a DRAFT for this problem
    const existingDraft = await this.attemptRepository.findDraftByUserAndProblem(userId, problemId);
    if (existingDraft) {
      return existingDraft;
    }

    // Create a new DRAFT
    const attemptData = {
      userId,
      problemId,
      status: 'DRAFT',
      startedAt: new Date(),
      lastSavedAt: new Date(),
      timeSpentSeconds: 0,
      draft: {
        requirements: '',
        assumptions: '',
        entities: '',
        relationships: '',
        flow: '',
        tradeoffs: '',
      }
    };

    return this.attemptRepository.create(attemptData);
  }
}
