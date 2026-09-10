import { AppError } from '../../utils/app-error.js';
import { OpenAIEvaluator } from './openai/openai-evaluator.js';
import { GeminiEvaluator } from './gemini/gemini-evaluator.js';
import { ProviderEvaluator } from './provider-evaluator.js';

function createProvider(name, env) {
  if (name === 'openai') {
    if (!env.openAiApiKey) throw new AppError(500, 'OPENAI_API_KEY is required when EVALUATOR_PROVIDER=openai');
    return new OpenAIEvaluator({ apiKey: env.openAiApiKey, model: env.openAiModel, version: env.openAiEvaluatorVersion, timeoutMs: env.evaluatorTimeoutMs });
  }
  if (name === 'gemini') {
    if (!env.geminiApiKey) throw new AppError(500, 'GEMINI_API_KEY is required when EVALUATOR_PROVIDER=gemini');
    return new GeminiEvaluator({ apiKey: env.geminiApiKey, model: env.geminiModel, version: env.geminiEvaluatorVersion, timeoutMs: env.evaluatorTimeoutMs });
  }
  throw new AppError(500, `Unsupported evaluator provider: ${name}`);
}

export function createEvaluator(env) {
  if (!env.evaluatorProvider) throw new AppError(500, 'EVALUATOR_PROVIDER must be configured as openai or gemini.');
  if (env.evaluatorProvider === 'mock' || env.evaluatorFallbackProvider === 'mock') throw new AppError(500, 'Mock evaluation is disabled. Configure a real evaluator provider.');
  const primary = createProvider(env.evaluatorProvider, env);
  const fallback = env.evaluatorFallbackProvider ? createProvider(env.evaluatorFallbackProvider, env) : null;
  if (fallback && env.evaluatorFallbackProvider === env.evaluatorProvider) throw new AppError(500, 'Evaluator fallback provider must differ from the primary provider.');
  return new ProviderEvaluator(primary, fallback);
}
