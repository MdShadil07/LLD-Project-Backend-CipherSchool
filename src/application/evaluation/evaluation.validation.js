import { AppError } from '../../utils/app-error.js';

const REQUIRED_SUBMISSION_FIELDS = [
  'requirements',
  'assumptions',
  'entities',
  'relationships',
  'flow',
  'tradeoffs',
];

export function validateSubmissionForEvaluation(submission) {
  if (!submission) {
    throw new AppError(400, 'Submission is required', { code: 'SUBMISSION_NOT_EVALUATABLE' });
  }

  const missingFields = REQUIRED_SUBMISSION_FIELDS.filter(
    (field) => typeof submission.content?.[field] !== 'string' || submission.content[field].trim().length < 12,
  );

  if (missingFields.length > 0) {
    throw new AppError(400, 'Submission does not contain enough evidence to evaluate.', {
      code: 'SUBMISSION_NOT_EVALUATABLE',
      fields: missingFields,
    });
  }

  return true;
}

export function validateRubric(rubric) {
  if (!rubric || !Array.isArray(rubric.criteria) || rubric.criteria.length === 0) {
    throw new AppError(400, 'A valid rubric is required.', { code: 'RUBRIC_INVALID' });
  }

  const ids = new Set();
  const totalWeight = rubric.criteria.reduce((total, criterion) => {
    if (!criterion.id || !criterion.name || !criterion.description || ids.has(criterion.id)) {
      throw new AppError(400, 'Rubric criteria are invalid.', { code: 'RUBRIC_INVALID' });
    }
    if (!Number.isFinite(criterion.weight) || criterion.weight < 0 || criterion.weight > 100) {
      throw new AppError(400, 'Rubric weights are invalid.', { code: 'RUBRIC_INVALID' });
    }
    ids.add(criterion.id);
    return total + criterion.weight;
  }, 0);

  if (Math.abs(totalWeight - 100) > 0.001) {
    throw new AppError(400, 'Rubric weights must total 100.', { code: 'RUBRIC_INVALID' });
  }

  return true;
}

export function validateEvaluationResult(result, rubric) {
  if (!result || !Array.isArray(result.criteria)) {
    throw new AppError(500, 'Evaluator returned an invalid result.', { code: 'EVALUATOR_INVALID_RESULT' });
  }

  const rubricIds = new Set(rubric.criteria.map((criterion) => criterion.id));
  const resultIds = result.criteria.map((criterion) => criterion.criterionId);

  if (result.criteria.length !== rubric.criteria.length || new Set(resultIds).size !== resultIds.length || resultIds.some((id) => !rubricIds.has(id))) {
    throw new AppError(500, 'Evaluator criteria do not match the rubric.', { code: 'EVALUATOR_INVALID_RESULT' });
  }

  for (const criterion of result.criteria) {
    if (!criterion.criterion || !criterion.evidence || !criterion.concern || !criterion.suggestion) {
      throw new AppError(500, 'Evaluator feedback is incomplete.', { code: 'EVALUATOR_INVALID_RESULT' });
    }
    if (!Number.isFinite(criterion.score) || criterion.score < 0 || criterion.score > 10) {
      throw new AppError(500, 'Evaluator score is outside the allowed range.', { code: 'EVALUATOR_INVALID_RESULT' });
    }
    if (!Number.isFinite(criterion.confidence) || criterion.confidence < 0 || criterion.confidence > 1) {
      throw new AppError(500, 'Evaluator confidence is outside the allowed range.', { code: 'EVALUATOR_INVALID_RESULT' });
    }
  }

  return true;
}

// Providers occasionally reproduce a rubric display name but alter its machine
// identifier. We may safely restore the identifier only when that display name
// maps to exactly one configured rubric criterion. Unknown names/IDs still fail
// validation; this never invents a score or changes evaluator feedback.
export function normalizeEvaluationResult(result, rubric) {
  if (!result || !Array.isArray(result.criteria)) return result;
  const byId = new Map(rubric.criteria.map((criterion) => [criterion.id, criterion]));
  const byName = new Map(rubric.criteria.map((criterion) => [normalizeCriterionName(criterion.name), criterion]));

  return {
    ...result,
    overallConfidence: normalizeProviderConfidence(result.overallConfidence),
    criteria: result.criteria.map((criterion) => {
      const matched = byId.get(criterion.criterionId) || byName.get(normalizeCriterionName(criterion.criterion));
      const normalizedCriterion = { ...criterion, confidence: normalizeProviderConfidence(criterion.confidence) };
      return matched ? { ...normalizedCriterion, criterionId: matched.id, criterion: matched.name } : normalizedCriterion;
    }),
  };
}

function normalizeCriterionName(value) {
  return typeof value === 'string' ? value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() : '';
}

function normalizeProviderConfidence(value) {
  // Gemini can return a whole-number percentage despite responseSchema bounds.
  // Only unambiguous integers are adapted. Fractions (including invalid 1.5),
  // strings, negative values, and values above 100 remain invalid and are
  // rejected by validateEvaluationResult.
  return Number.isInteger(value) && value >= 2 && value <= 100 ? value / 100 : value;
}

export function calculateWeightedScore(criteria, rubric) {
  const weights = new Map(rubric.criteria.map((criterion) => [criterion.id, criterion.weight]));
  const weightedTotal = criteria.reduce((total, criterion) => {
    const weight = weights.get(criterion.criterionId);
    if (!Number.isFinite(weight)) {
      throw new AppError(500, 'Evaluator criteria cannot be mapped to rubric weights.', { code: 'EVALUATOR_INVALID_RESULT' });
    }
    return total + (criterion.score / 10) * weight;
  }, 0);

  // Round only the final total so criterion contributions do not accumulate rounding drift.
  return Number(weightedTotal.toFixed(2));
}
