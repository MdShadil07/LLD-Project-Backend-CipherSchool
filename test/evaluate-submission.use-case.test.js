import assert from 'node:assert/strict';
import test from 'node:test';
import { EvaluateSubmission } from '../src/application/evaluation/evaluate-submission.use-case.js';

const rubric = [
  { id: 'requirements', criterion: 'Requirements', description: 'Coverage.', weight: 60 },
  { id: 'design', criterion: 'Design', description: 'Quality.', weight: 40 },
];

const submission = {
  _id: 'submission-1',
  userId: 'user-1',
  attemptId: 'attempt-1',
  problemId: 'parking-lot',
  content: {
    requirements: 'Enough requirements evidence.', assumptions: 'Enough assumptions evidence.', entities: 'Enough entities evidence.', relationships: 'Enough relationship evidence.', flow: 'Enough flow evidence.', tradeoffs: 'Enough tradeoff evidence.',
  },
};

function setup({ existing = null, evaluator } = {}) {
  const calls = { create: 0, update: [] };
  const evaluationRepository = {
    findBySubmissionId: async () => existing,
    create: async (data) => { calls.create += 1; return { _id: 'evaluation-1', ...data }; },
    update: async (_id, changes) => { calls.update.push(changes); return { _id: 'evaluation-1', ...changes }; },
  };
  const evaluatorPort = evaluator || {
    type: 'AI',
    version: 'v1',
    evaluate: async () => ({
      criteria: [
        { criterionId: 'requirements', criterion: 'Requirements', score: 8, evidence: 'Evidence', concern: 'Concern', suggestion: 'Suggestion', confidence: 0.9 },
        { criterionId: 'design', criterion: 'Design', score: 6, evidence: 'Evidence', concern: 'Concern', suggestion: 'Suggestion', confidence: 0.8 },
      ],
      overallSummary: 'Summary', topImprovements: ['Improve design'], overallConfidence: 0.85,
    }),
  };
  return {
    calls,
    useCase: new EvaluateSubmission({
      submissionRepository: { findById: async () => submission },
      evaluationRepository,
      problemRepository: { findById: async () => ({ rubricVersion: 'v1', rubric }) },
      evaluator: evaluatorPort,
    }),
  };
}

test('evaluates a submitted snapshot and calculates weighted score', async () => {
  const { useCase, calls } = setup();
  const result = await useCase.execute('user-1', 'submission-1');
  assert.equal(result.status, 'COMPLETED');
  assert.equal(result.overallScore, 72);
  assert.equal(calls.create, 1);
  assert.equal(calls.update[0].status, 'COMPLETED');
});

test('returns an existing evaluation without invoking the evaluator', async () => {
  let invoked = false;
  const { useCase, calls } = setup({ existing: { _id: 'evaluation-1', status: 'COMPLETED' }, evaluator: { type: 'AI', version: 'v1', evaluate: async () => { invoked = true; } } });
  const result = await useCase.execute('user-1', 'submission-1');
  assert.equal(result.status, 'COMPLETED');
  assert.equal(invoked, false);
  assert.equal(calls.create, 0);
});

test('marks evaluation failed when the evaluator is unavailable', async () => {
  const { useCase, calls } = setup({ evaluator: { type: 'AI', version: 'v1', evaluate: async () => { throw new Error('provider unavailable'); } } });
  await assert.rejects(() => useCase.execute('user-1', 'submission-1'), (error) => error.statusCode === 502);
  assert.equal(calls.update.at(-1).status, 'FAILED');
});

test('retries a failed evaluation using the same evaluation record', async () => {
  const existing = { _id: 'evaluation-1', status: 'FAILED' };
  const { useCase, calls } = setup({ existing });
  const result = await useCase.execute('user-1', 'submission-1');

  assert.equal(result.status, 'COMPLETED');
  assert.equal(calls.create, 0);
  assert.equal(calls.update[0].status, 'EVALUATING');
  assert.equal(calls.update[1].status, 'COMPLETED');
});
