import { Evaluator } from '../../../domain/evaluation/Evaluator.js';
import { EVALUATOR_TYPES } from '../../../domain/evaluation/Evaluation.js';
import { buildEvaluationPrompt, buildEvaluationSystemPrompt, evaluationResponseSchema, providerError, requestJson } from '../ai-evaluator.utils.js';

export class OpenAIEvaluator extends Evaluator {
  constructor({ apiKey, model, version = 'v1', timeoutMs = 30000 }) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.evaluatorVersion = version;
    this.timeoutMs = timeoutMs;
  }

  get type() { return EVALUATOR_TYPES.AI; }
  get version() { return this.evaluatorVersion; }
  get modelName() { return this.model; }

  async evaluate(problem, submission, rubric) {
    try {
      const response = await requestJson('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          input: [
            { role: 'system', content: [{ type: 'input_text', text: buildEvaluationSystemPrompt() }] },
            { role: 'user', content: [{ type: 'input_text', text: buildEvaluationPrompt(problem, submission, rubric) }] },
          ],
          text: { format: { type: 'json_schema', name: 'lld_evaluation', strict: true, schema: evaluationResponseSchema } },
        }),
      }, this.timeoutMs);

      const output = response.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;
      if (!output) throw new Error('OpenAI returned no structured evaluation.');
      return JSON.parse(output);
    } catch (error) {
      throw providerError(error, 'OpenAI');
    }
  }
}
