import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import env from './config/env.js';
import { ApiError } from './utils/ApiError.js';
import authRouter from './routes/auth.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import articleRouter from './routes/article.routes.js';

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

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
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
