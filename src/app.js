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
import { evaluationRouter } from './routes/evaluation.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';

export const app = express();

// --------------------------------------------------
// Trust proxy
// --------------------------------------------------

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

// --------------------------------------------------
// Security
// --------------------------------------------------

app.use(helmet());

// --------------------------------------------------
// CORS
// --------------------------------------------------

// env.clientUrl is already an array because env.js does:
//
// process.env.CLIENT_URL.split(',').map(...)

const allowedOrigins = [
  ...env.clientUrl,

  // Local development
  'http://localhost:5173',
  'http://localhost:3000',
];

const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins),
];

console.log('Allowed CORS origins:', uniqueAllowedOrigins);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header.
    // Useful for Postman, curl, server-to-server requests, etc.
    if (!origin) {
      return callback(null, true);
    }

    if (uniqueAllowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.error(`CORS rejected origin: ${origin}`);

    return callback(
      new Error(`CORS: origin ${origin} is not allowed`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// --------------------------------------------------
// Body parsing
// --------------------------------------------------

app.use(express.json({
  limit: env.jsonBodyLimit,
}));

app.use(cookieParser());

// --------------------------------------------------
// Logging
// --------------------------------------------------

app.use(
  morgan(
    env.nodeEnv === 'production'
      ? 'combined'
      : 'dev'
  )
);

// --------------------------------------------------
// Health check
// --------------------------------------------------

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
  });
});

// --------------------------------------------------
// Routes
// --------------------------------------------------

app.use('/api/v1/auth', authRouter);

app.use('/api/v1/problems', problemRouter);

app.use('/api/v1/practice', attemptRouter);

app.use('/api/v1/attempts', attemptRouter);

app.use('/api/v1', submissionRouter);

app.use('/api/v1', evaluationRouter);

app.use('/api/v1/dashboard', dashboardRouter);

// --------------------------------------------------
// 404
// --------------------------------------------------

app.use(notFound);

// --------------------------------------------------
// Error handler
// --------------------------------------------------

app.use(errorHandler);