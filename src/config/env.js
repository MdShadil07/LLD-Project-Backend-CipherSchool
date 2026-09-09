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
  clientUrl: process.env.CLIENT_URL.split(',').map((u) => u.trim()),
});
