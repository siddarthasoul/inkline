import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import env from './config/env.js';
import { ApiError } from './utils/ApiError.js';
import authRouter from './routes/auth.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import articleRouter from './routes/article.routes.js';
import mongoDatabase from './config/database.js';
import { redisClient } from './config/redis.js';

const app = express();

const allowedOrigins = [
  env.frontend.url,
  ...env.cors.allowedOrigins.split(','),
]
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');

app.use(helmet());

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Requests without an Origin header include server-to-server calls.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new ApiError(403, 'Origin not allowed'));
    },
  }),
);

app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(cookieParser());


app.get('/health', async (_req, res) => {
  let mongodb: 'connected' | 'disconnected' = 'disconnected';
  let redis: 'connected' | 'disconnected' = 'disconnected';

  try {
    mongodb = (await mongoDatabase.healthCheck())
      ? 'connected'
      : 'disconnected';
  } catch {
    mongodb = 'disconnected';
  }

  try {
    if (redisClient.isReady) {
      await redisClient.ping();
      redis = 'connected';
    }
  } catch {
    redis = 'disconnected';
  }

  const healthy = mongodb === 'connected' && redis === 'connected';

  return res.status(healthy ? 200 : 503).json({
    success: healthy,
    service: 'Inkline API',
    dependencies: {
      mongodb,
      redis,
    },
    timestamp: new Date().toISOString(),
  });
});


app.use(`${env.app.apiPrefix}/auth`, authRouter);

app.use(`${env.app.apiPrefix}/articles`, articleRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use(errorMiddleware);

export default app;
