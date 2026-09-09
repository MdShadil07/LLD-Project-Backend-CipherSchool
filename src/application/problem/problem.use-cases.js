import { AppError } from '../../utils/app-error.js';

export class GetProblems {
  constructor(problemRepository) { this.problemRepository = problemRepository; }

  async execute() { return this.problemRepository.findAll(); }
}

export class GetProblem {
  constructor(problemRepository) { this.problemRepository = problemRepository; }

  async execute(slug) {
    const problem = await this.problemRepository.findBySlug(slug);
    if (!problem) throw new AppError(404, 'Problem not found');
    return problem;
  }
}
