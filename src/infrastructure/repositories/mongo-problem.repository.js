import { Problem } from '../../models/problem.model.js';
import { ProblemRepository } from '../../domain/problem/ProblemRepository.js';

export class MongoProblemRepository extends ProblemRepository {
  async findAll() {
    return Problem.find({}).sort({ createdAt: 1 }).lean();
  }

  async findBySlug(slug) {
    return Problem.findOne({ slug }).lean();
  }
}
