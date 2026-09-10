import assert from 'node:assert/strict';
import test from 'node:test';
import { createEvaluator } from '../src/infrastructure/ai/create-evaluator.js';
import { ProviderEvaluator } from '../src/infrastructure/ai/provider-evaluator.js';

const baseEnv = {
  evaluatorProvider: '',
  evaluatorFallbackProvider: '',
  evaluatorTimeoutMs: 1000,
  openAiApiKey: '',
  openAiModel: 'test-model',
  openAiEvaluatorVersion: 'openai-test-v1',
  geminiApiKey: '',
  geminiModel: 'test-model',
  geminiEvaluatorVersion: 'gemini-test-v1',
};

test('requires an explicitly configured real evaluator provider', () => {
  assert.throws(() => createEvaluator(baseEnv), /EVALUATOR_PROVIDER/);
  assert.throws(() => createEvaluator({ ...baseEnv, evaluatorProvider: 'mock' }), /Mock evaluation is disabled/);
});

test('fails fast when a configured provider has no key', () => {
  assert.throws(() => createEvaluator({ ...baseEnv, evaluatorProvider: 'gemini' }), /GEMINI_API_KEY/);
  assert.throws(() => createEvaluator({ ...baseEnv, evaluatorProvider: 'openai' }), /OPENAI_API_KEY/);
});

test('uses fallback only when the primary evaluator fails', async () => {
  const primary = { type: 'AI', version: 'primary-v1', evaluate: async () => { throw new Error('primary failed'); } };
  const fallback = { type: 'AI', version: 'fallback-v1', evaluate: async () => ({ ok: true }) };
  const evaluator = new ProviderEvaluator(primary, fallback);
  assert.deepEqual(await evaluator.evaluate({}, {}, {}), { ok: true });
  assert.equal(evaluator.version, 'primary-v1+fallback-fallback-v1');
});
