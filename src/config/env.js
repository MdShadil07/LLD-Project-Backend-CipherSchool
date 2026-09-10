import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET', 'CLIENT_URL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  jsonBodyLimit: process.env.JSON_BODY_LIMIT ?? '256kb',
  evaluatorProvider: process.env.EVALUATOR_PROVIDER ?? '',
  evaluatorFallbackProvider: process.env.EVALUATOR_FALLBACK_PROVIDER ?? '',
  evaluatorTimeoutMs: Number(process.env.EVALUATOR_TIMEOUT_MS ?? 30000),
  openAiApiKey: process.env.OPENAI_API_KEY ?? '',
  openAiModel: process.env.OPENAI_MODEL ?? 'gpt-4.1-mini',
  openAiEvaluatorVersion: process.env.OPENAI_EVALUATOR_VERSION ?? 'openai-v1',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  geminiEvaluatorVersion: process.env.GEMINI_EVALUATOR_VERSION ?? 'gemini-v1',
  clientUrl: process.env.CLIENT_URL.split(',').map((u) => u.trim()),
});
