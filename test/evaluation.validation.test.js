import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateWeightedScore,
  normalizeEvaluationResult,
  validateEvaluationResult,
  validateRubric,
  validateSubmissionForEvaluation,
} from '../src/application/evaluation/evaluation.validation.js';

const rubric = {
  version: 'v1',
  criteria: [
    { id: 'requirements', name: 'Requirements', description: 'Requirement coverage.', weight: 60 },
    { id: 'design', name: 'Design', description: 'Design quality.', weight: 40 },
  ],
};

const result = {
  criteria: [
    { criterionId: 'requirements', criterion: 'Requirements', score: 8, evidence: 'Evidence', concern: 'Concern', suggestion: 'Suggestion', confidence: 0.9 },
    { criterionId: 'design', criterion: 'Design', score: 6, evidence: 'Evidence', concern: 'Concern', suggestion: 'Suggestion', confidence: 0.8 },
  ],
  overallSummary: 'Summary',
  topImprovements: ['Improve design'],
  overallConfidence: 0.85,
};

test('validates a complete submission for evaluation', () => {
  assert.equal(validateSubmissionForEvaluation({ content: {
    requirements: 'Enough requirements evidence.', assumptions: 'Enough assumptions evidence.', entities: 'Enough entities evidence.', relationships: 'Enough relationship evidence.', flow: 'Enough flow evidence.', tradeoffs: 'Enough tradeoff evidence.',
  } }), true);
});

test('rejects invalid rubric weights', () => {
  assert.throws(() => validateRubric({ ...rubric, criteria: rubric.criteria.map((criterion) => ({ ...criterion, weight: 40 })) }), /Rubric weights must total 100/);
});

test('rejects missing evaluator criteria', () => {
  assert.throws(() => validateEvaluationResult({ ...result, criteria: result.criteria.slice(1) }, rubric), /do not match the rubric/);
});

test('calculates weighted score in the backend', () => {
  validateRubric(rubric);
  validateEvaluationResult(result, rubric);
  assert.equal(calculateWeightedScore(result.criteria, rubric), 72);
});

test('rounds only the final weighted total consistently', () => {
  const decimalResult = {
    criteria: [
      { criterionId: 'requirements', criterion: 'Requirements', score: 7.25, evidence: 'Evidence', concern: 'Concern', suggestion: 'Suggestion', confidence: 0.9 },
      { criterionId: 'design', criterion: 'Design', score: 6.75, evidence: 'Evidence', concern: 'Concern', suggestion: 'Suggestion', confidence: 0.8 },
    ],
  };
  validateEvaluationResult(decimalResult, rubric);
  assert.equal(calculateWeightedScore(decimalResult.criteria, rubric), 70.5);
});

test('normalizes an evaluator criterion ID only when its display name matches the configured rubric', () => {
  const normalized = normalizeEvaluationResult({ ...result, criteria: [{ ...result.criteria[0], criterionId: 'requirement-coverage' }, result.criteria[1]] }, rubric);
  assert.equal(normalized.criteria[0].criterionId, 'requirements');
  assert.equal(normalized.criteria[0].criterion, 'Requirements');

  const unknown = normalizeEvaluationResult({ ...result, criteria: [{ ...result.criteria[0], criterionId: 'unknown', criterion: 'Unconfigured criterion' }, result.criteria[1]] }, rubric);
  assert.throws(() => validateEvaluationResult(unknown, rubric), /do not match the rubric/);
});

test('normalizes only whole-number provider confidence percentages', () => {
  const normalized = normalizeEvaluationResult({
    ...result,
    overallConfidence: 87,
    criteria: result.criteria.map((criterion, index) => ({ ...criterion, confidence: index ? 91 : 86 })),
  }, rubric);
  assert.equal(normalized.overallConfidence, 0.87);
  assert.deepEqual(normalized.criteria.map((criterion) => criterion.confidence), [0.86, 0.91]);

  const invalidFraction = normalizeEvaluationResult({ ...result, criteria: [{ ...result.criteria[0], confidence: 1.5 }, result.criteria[1]] }, rubric);
  assert.throws(() => validateEvaluationResult(invalidFraction, rubric), /confidence is outside/);
});
