import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { authRouter } from './routes/auth.routes.js';
import { problemRouter } from './routes/problem.routes.js';
import attemptRouter from './routes/attempt.routes.js';
import { submissionRouter } from './routes/submission.routes.js';

export const app = express();
app.use(helmet());
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (e.g. curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (env.clientUrl.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} is not allowed`));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: env.jsonBodyLimit }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/problems', problemRouter);
app.use('/api/v1/practice', attemptRouter);
app.use('/api/v1/attempts', attemptRouter);
app.use('/api/v1', submissionRouter);
app.use(notFound);
app.use(errorHandler);
