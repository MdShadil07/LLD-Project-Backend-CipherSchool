import assert from 'node:assert/strict';
import test from 'node:test';
import { buildEvaluationPrompt, buildEvaluationSystemPrompt } from '../src/infrastructure/ai/ai-evaluator.utils.js';

test('sends the complete problem, rubric, and frozen learner submission as an evaluation packet', () => {
  const prompt = buildEvaluationPrompt(
    {
      title: 'Parking Lot',
      description: 'Design a multi-floor parking lot.',
      requirements: ['Assign a spot'],
      nonFunctionalRequirements: ['Prevent double allocation'],
      beforeYouStart: ['Explain trade-offs'],
    },
    { attemptId: 'attempt-123', submittedAt: '2026-09-09T10:00:00.000Z', content: { requirements: 'Vehicles are assigned by type.' } },
    { version: 'v1', criteria: [{ id: 'requirements', name: 'Requirements', description: 'Coverage', weight: 100 }] },
  );

  assert.match(prompt, /PROBLEM BRIEF/);
  assert.match(prompt, /Assign a spot/);
  assert.match(prompt, /RUBRIC/);
  assert.match(prompt, /FROZEN LEARNER SUBMISSION/);
  assert.match(prompt, /Vehicles are assigned by type/);
  assert.match(buildEvaluationSystemPrompt(), /untrusted reference data/);
});
