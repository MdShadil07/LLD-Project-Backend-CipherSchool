import { Evaluator } from '../../domain/evaluation/Evaluator.js';

export class ProviderEvaluator extends Evaluator {
  constructor(primary, fallback = null) {
    super();
    this.primary = primary;
    this.fallback = fallback;
  }

  get type() { return this.primary.type; }
  get version() { return this.fallback ? `${this.primary.version}+fallback-${this.fallback.version}` : this.primary.version; }
  get modelName() { return this.primary.modelName ?? null; }

  async evaluate(problem, submission, rubric) {
    try {
      return await this.primary.evaluate(problem, submission, rubric);
    } catch (primaryError) {
      if (!this.fallback) throw primaryError;
      return this.fallback.evaluate(problem, submission, rubric);
    }
  }
}
