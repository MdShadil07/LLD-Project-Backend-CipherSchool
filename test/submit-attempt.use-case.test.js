import assert from 'node:assert/strict';
import test from 'node:test';
import { SubmitAttempt } from '../src/application/submission/submit-attempt.use-case.js';
import { SaveDraft } from '../src/application/attempt/save-draft.use-case.js';

const completeDraft = {
  requirements: 'The system supports vehicle entry and exit across multiple floors.',
  assumptions: 'Spot availability is updated atomically when a vehicle is assigned.',
  entities: 'ParkingLot owns floors, spots, gates, tickets, and payment records.',
  relationships: 'ParkingLot coordinates floors while strategies own pricing decisions.',
  flow: 'Entry gate assigns a spot, issues a ticket, and records the vehicle state.',
  tradeoffs: 'Concurrent allocation is protected and payment failure keeps the ticket open.',
};

function repositories({ attempt = {}, existingSubmission = null, updatedAttempt = { status: 'SUBMITTED' } } = {}) {
  const calls = { createSubmission: 0, markSubmitted: 0 };
  return {
    calls,
    attemptRepository: {
      findById: async () => ({ userId: 'user-1', problemId: 'parking-lot', status: 'DRAFT', draft: completeDraft, ...attempt }),
      markSubmitted: async () => {
        calls.markSubmitted += 1;
        return updatedAttempt;
      },
    },
    submissionRepository: {
      findByAttemptId: async () => existingSubmission,
      create: async (data) => {
        calls.createSubmission += 1;
        return { _id: 'submission-1', ...data };
      },
    },
  };
}

test('submits a complete draft and freezes the attempt', async () => {
  const repos = repositories();
  const useCase = new SubmitAttempt(repos.attemptRepository, repos.submissionRepository);

  const result = await useCase.execute('user-1', 'attempt-1');

  assert.equal(result.attemptStatus, 'SUBMITTED');
  assert.equal(result.submission.content.requirements, completeDraft.requirements);
  assert.equal(repos.calls.createSubmission, 1);
  assert.equal(repos.calls.markSubmitted, 1);
});

test('rejects incomplete submissions without creating a snapshot', async () => {
  const repos = repositories({ attempt: { draft: { ...completeDraft, flow: '' } } });
  const useCase = new SubmitAttempt(repos.attemptRepository, repos.submissionRepository);

  await assert.rejects(() => useCase.execute('user-1', 'attempt-1'), (error) => {
    assert.equal(error.statusCode, 400);
    assert.equal(error.details.code, 'SUBMISSION_INCOMPLETE');
    assert.deepEqual(error.details.fields, ['flow']);
    return true;
  });
  assert.equal(repos.calls.createSubmission, 0);
});

test('rejects attempts owned by another user', async () => {
  const repos = repositories({ attempt: { userId: 'user-2' } });
  const useCase = new SubmitAttempt(repos.attemptRepository, repos.submissionRepository);

  await assert.rejects(() => useCase.execute('user-1', 'attempt-1'), (error) => error.statusCode === 403);
  assert.equal(repos.calls.createSubmission, 0);
});

test('rejects an existing submission', async () => {
  const repos = repositories({ existingSubmission: { _id: 'submission-1' } });
  const useCase = new SubmitAttempt(repos.attemptRepository, repos.submissionRepository);

  await assert.rejects(() => useCase.execute('user-1', 'attempt-1'), (error) => error.statusCode === 409);
  assert.equal(repos.calls.createSubmission, 0);
});

test('rejects attempts that are already submitted', async () => {
  const repos = repositories({ attempt: { status: 'SUBMITTED' } });
  const useCase = new SubmitAttempt(repos.attemptRepository, repos.submissionRepository);

  await assert.rejects(() => useCase.execute('user-1', 'attempt-1'), (error) => error.statusCode === 409);
  assert.equal(repos.calls.createSubmission, 0);
});

test('rejects a draft write when the repository detects a submitted race', async () => {
  const attemptRepository = {
    findById: async () => ({ userId: 'user-1', status: 'DRAFT', draft: completeDraft, timeSpentSeconds: 10 }),
    updateDraft: async () => null,
  };
  const useCase = new SaveDraft(attemptRepository);

  await assert.rejects(
    () => useCase.execute('user-1', 'attempt-1', { requirements: completeDraft.requirements }, 11),
    (error) => error.statusCode === 409,
  );
});
