import process from 'node:process';
import app from './app.js';
import env from './config/env.js';
import mongoDatabase from './config/database.js';
import {
  connectRedis,
  disconnectRedis,
} from './config/redis.js';

async function startServer(): Promise<void> {
  await mongoDatabase.connect();
  await connectRedis();

  const server = app.listen(env.server.port, env.server.host, () => {
    console.log(
      `${env.app.name} API running on port ${env.server.port}`,
    );
  });

  const shutdown = () => {
    console.log('Shutting down server...');

    server.close(() => {
      void Promise.all([
        mongoDatabase.disconnect(),
        disconnectRedis(),
      ])
        .then(() => {
          console.log('Server, database, and Redis disconnected');
        })
        .catch((error: unknown) => {
          console.error('Shutdown failed:', error);
          process.exitCode = 1;
        });
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

startServer().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exitCode = 1;
});
