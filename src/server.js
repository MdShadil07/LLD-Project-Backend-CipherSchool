import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { seedProblems } from './infrastructure/database/problem.seed.js';

async function start() {
  await connectDatabase();
  await seedProblems();
  app.listen(env.port, '0.0.0.0', () => console.info(`API listening on port ${env.port}`));
}

start().catch((error) => { console.error('Unable to start API', error); process.exit(1); });
