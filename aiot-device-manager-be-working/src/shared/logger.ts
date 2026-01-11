import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          translateTime: true,
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  level: process.env.LOG_LEVEL ?? 'info'
});
