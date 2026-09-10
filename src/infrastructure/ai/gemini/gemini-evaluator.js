import { Evaluator } from '../../../domain/evaluation/Evaluator.js';
import { EVALUATOR_TYPES } from '../../../domain/evaluation/Evaluation.js';
import { buildEvaluationPrompt, buildEvaluationSystemPrompt, evaluationResponseSchema, providerError, requestJson } from '../ai-evaluator.utils.js';

function toGeminiSchema(schema) {
  if (schema.type === 'object') {
    return { type: 'OBJECT', properties: Object.fromEntries(Object.entries(schema.properties).map(([key, value]) => [key, toGeminiSchema(value)])), required: schema.required };
  }
  if (schema.type === 'array') return { type: 'ARRAY', items: toGeminiSchema(schema.items) };
  if (schema.type === 'number') return { type: 'NUMBER', ...(schema.minimum != null && { minimum: schema.minimum }), ...(schema.maximum != null && { maximum: schema.maximum }) };
  return { type: 'STRING' };
}

export class GeminiEvaluator extends Evaluator {
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
      const response = await requestJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: buildEvaluationSystemPrompt() }] },
          contents: [{ role: 'user', parts: [{ text: buildEvaluationPrompt(problem, submission, rubric) }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: toGeminiSchema(evaluationResponseSchema), temperature: 0.1 },
        }),
      }, this.timeoutMs);
      const output = response.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
      if (!output) throw new Error('Gemini returned no structured evaluation.');
      return JSON.parse(output);
    } catch (error) {
      throw providerError(error, 'Gemini');
    }
  }
}
