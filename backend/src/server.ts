import process from 'node:process';
import app from './app.js';
import env from './config/env.js';
import mongoDatabase from './config/database.js';

async function startServer(): Promise<void> {
  await mongoDatabase.connect();

  const server = app.listen(env.server.port, env.server.host, () => {
    console.log(
      `${env.app.name} API running on port ${env.server.port}`,
    );
  });

  const shutdown = () => {
    console.log('Shutting down server...');

    server.close(() => {
      void mongoDatabase.disconnect()
        .then(() => {
          console.log('Server and database disconnected');
        })
        .catch((error: unknown) => {
          console.error('Database shutdown failed:', error);
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
