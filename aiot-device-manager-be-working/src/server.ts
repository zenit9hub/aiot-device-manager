import { app } from './app';
import { env } from './config/env';
import { pool } from './infrastructure/db/pool';
import { logger } from './shared/logger';

const server = app.listen(env.port, () => {
  logger.info(
    {
      port: env.port,
      env: process.env.NODE_ENV ?? 'development'
    },
    'API server listening'
  );
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down gracefully');
  server.close(async () => {
    await pool.end();
    logger.info('Database pool closed, exiting');
    process.exit(0);
  });
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
